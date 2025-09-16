import { Router } from "express";
import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../config/database";
import jwt from "jsonwebtoken";

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

interface GoogleUserResponse {
  email: string;
  name?: string;
  picture?: string;
}

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface MicrosoftUserResponse {
  mail: string;
  userPrincipalName: string;
}

const router = Router();

// Debug endpoint - REMOVE IN PRODUCTION
router.get("/debug/env", (req: Request, res: Response) => {
  res.json({
    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID,
    GMAIL_REDIRECT_URI: process.env.GMAIL_REDIRECT_URI,
    GMAIL_CLIENT_SECRET_EXISTS: !!process.env.GMAIL_CLIENT_SECRET,
    GMAIL_CLIENT_SECRET_LENGTH: process.env.GMAIL_CLIENT_SECRET?.length || 0,
  });
});

// GET endpoint for Gmail OAuth redirect
router.get("/gmail/callback", async (req: Request, res: Response) => {
  const { code, state } = req.query;
  console.log("STATE", state);

  if (!code) {
    return res.redirect(
      "https://campaign.shoppingsto.com/campaigns/new?error=no_code"
    );
  }

  // Validate environment variables
  if (
    !process.env.GMAIL_CLIENT_ID ||
    !process.env.GMAIL_CLIENT_SECRET ||
    !process.env.GMAIL_REDIRECT_URI
  ) {
    console.error("Missing Gmail OAuth environment variables");
    return res.redirect(
      "https://campaign.shoppingsto.com/campaigns/new?error=missing_config"
    );
  }

  try {
    // Exchange code for tokens
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code: code as string,
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
        redirect_uri: process.env.GMAIL_REDIRECT_URI!,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const tokens = response.data as GoogleTokenResponse;
    console.log("Token exchange successful");

    if (tokens.access_token) {
      // ✅ FIRST: Verify token with OAuth2 userinfo endpoint
      console.log("Verifying token with OAuth2 userinfo endpoint...");
      try {
        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const userInfo = userInfoResponse.data as GoogleUserResponse;
        console.log("User info verified:", userInfo.email);

        // ✅ SECOND: Now try Gmail API (optional)
        try {
          const gmailProfileResponse = await axios.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/profile",
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Gmail profile access successful");
        } catch (gmailError: any) {
          console.warn(
            "Gmail API access failed (but OAuth succeeded):",
            gmailError.response?.data || gmailError.message
          );
          // Continue anyway - OAuth succeeded even if Gmail API has issues
        }

        // Extract userId from JWT token in state parameter
        let userId = null;

        if (state && process.env.JWT_SECRET) {
          try {
            const decodedState = decodeURIComponent(state as string);
            const decoded = jwt.verify(
              decodedState,
              process.env.JWT_SECRET!
            ) as any;
            userId = decoded.id; // Based on your JWT payload structure
            console.log("User ID from state JWT:", userId);
          } catch (error) {
            console.log("Invalid JWT token in state parameter:", error);
          }
        }

        // Save sender when OAuth succeeds (requires userId)
        if (userId) {
          try {
            // Check if sender already exists for this user
            const existingSender = await prisma.sender.findFirst({
              where: {
                email: userInfo.email,
                userId: userId,
              },
            });

            if (!existingSender) {
              const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

              await prisma.sender.create({
                data: {
                  name: userInfo.name || userInfo.email.split("@")[0],
                  email: userInfo.email,
                  isVerified: true,
                  provider: "gmail",
                  accessToken: tokens.access_token,
                  refreshToken: tokens.refresh_token,
                  expiresAt: expiresAt,
                  userId: userId,
                },
              });
              console.log("Sender saved to database");
            } else {
              // Update existing sender with new tokens
              const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

              await prisma.sender.update({
                where: { id: existingSender.id },
                data: {
                  accessToken: tokens.access_token,
                  refreshToken: tokens.refresh_token,
                  expiresAt: expiresAt,
                  isVerified: true,
                },
              });
              console.log("Sender tokens updated in database");
            }
          } catch (dbError) {
            console.error("Database error saving sender:", dbError);
            // Continue with redirect even if DB save fails
          }
        } else {
          console.log("No userId found - sender not saved to database");
        }

        // Redirect to frontend with success message
        const encodedEmail = encodeURIComponent(userInfo.email);
        const redirectUrl = `https://campaign.shoppingsto.com/campaigns/new?success=gmail_connected&email=${encodedEmail}`;

        return res.redirect(redirectUrl);
      } catch (userInfoError: any) {
        console.error("OAuth token verification failed:", {
          status: userInfoError.response?.status,
          data: userInfoError.response?.data,
          message: userInfoError.message,
        });
        return res.redirect(
          "https://campaign.shoppingsto.com/campaigns/new?error=token_verification_failed"
        );
      }
    } else {
      return res.redirect(
        "https://campaign.shoppingsto.com/campaigns/new?error=token_exchange_failed"
      );
    }
  } catch (err: any) {
    console.error("OAuth Token Exchange Error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
    return res.redirect(
      "https://campaign.shoppingsto.com/campaigns/new?error=oauth_failed"
    );
  }
});

// GET endpoint for Outlook OAuth redirect
router.get("/outlook/callback", async (req: Request, res: Response) => {
  const { code, state } = req.query;
  console.log("Outlook callback received - code:", code ? "present" : "missing");
  console.log("Outlook STATE:", state);
  console.log("Full query params:", req.query);

  if (!code) {
    return res.redirect(
      "https://campaign.shoppingsto.com/campaigns/new?error=no_code"
    );
  }

  if (
    !process.env.OUTLOOK_CLIENT_ID ||
    !process.env.OUTLOOK_CLIENT_SECRET ||
    !process.env.OUTLOOK_REDIRECT_URI
  ) {
    console.error("Missing Outlook OAuth environment variables");
    return res.redirect(
      "https://campaign.shoppingsto.com/campaigns/new?error=missing_config"
    );
  }

  try {
    console.log("Attempting Outlook token exchange...");
    const tokenParams = {
      code: code as string,
      client_id: process.env.OUTLOOK_CLIENT_ID!,
      client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
      redirect_uri: process.env.OUTLOOK_REDIRECT_URI!,
      grant_type: "authorization_code",
      scope: process.env.OUTLOOK_SCOPES!,
    };
    console.log("Token exchange params:", { ...tokenParams, client_secret: "[HIDDEN]" });
    
    const response = await axios.post(
      `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      new URLSearchParams(tokenParams).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const tokens = response.data as MicrosoftTokenResponse;
    console.log("Outlook token exchange successful");
    console.log("Token response keys:", Object.keys(tokens));
    console.log("Has refresh_token:", !!tokens.refresh_token);

    if (tokens.access_token) {
      console.log("Verifying token with Microsoft Graph API...");
      try {
        const userInfoResponse = await axios.get(
          "https://graph.microsoft.com/v1.0/me",
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const userInfo = userInfoResponse.data as MicrosoftUserResponse;
        const userEmail = userInfo.mail || userInfo.userPrincipalName;
        console.log("Outlook user info verified:", userEmail);
        console.log("User info object keys:", Object.keys(userInfo));

        let userId = null;

        if (state && process.env.JWT_SECRET) {
          try {
            const decodedState = decodeURIComponent(state as string);
            const decoded = jwt.verify(
              decodedState,
              process.env.JWT_SECRET!
            ) as any;
            userId = decoded.id;
            console.log("User ID from state JWT:", userId);
          } catch (error) {
            console.log("Invalid JWT token in state parameter:", error);
          }
        } else {
          console.log("No state parameter or JWT_SECRET found");
        }

        if (userId) {
          try {
            const existingSender = await prisma.sender.findFirst({
              where: {
                email: userEmail,
                userId: userId,
              },
            });

            if (!existingSender) {
              const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

              await prisma.sender.create({
                data: {
                  name: userEmail.split("@")[0],
                  email: userEmail,
                  isVerified: true,
                  provider: "outlook",
                  accessToken: tokens.access_token,
                  refreshToken: tokens.refresh_token || null,
                  expiresAt: expiresAt,
                  userId: userId,
                },
              });
              console.log("Outlook sender saved to database");
            } else {
              const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

              await prisma.sender.update({
                where: { id: existingSender.id },
                data: {
                  accessToken: tokens.access_token,
                  refreshToken: tokens.refresh_token || existingSender.refreshToken,
                  expiresAt: expiresAt,
                  isVerified: true,
                },
              });
              console.log("Outlook sender tokens updated in database");
            }
          } catch (dbError) {
            console.error("Database error saving Outlook sender:", dbError);
          }
        } else {
          console.log("No userId found - Outlook sender not saved to database");
        }

        const encodedEmail = encodeURIComponent(userEmail);
        const redirectUrl = `https://campaign.shoppingsto.com/campaigns/new?success=outlook_connected&email=${encodedEmail}`;
        console.log("Redirecting to:", redirectUrl);

        return res.redirect(redirectUrl);
      } catch (userInfoError: any) {
        console.error("Outlook token verification failed:", {
          status: userInfoError.response?.status,
          data: userInfoError.response?.data,
          message: userInfoError.message,
        });
        return res.redirect(
          "https://campaign.shoppingsto.com/campaigns/new?error=token_verification_failed"
        );
      }
    } else {
      return res.redirect(
        "https://campaign.shoppingsto.com/campaigns/new?error=token_exchange_failed"
      );
    }
  } catch (err: any) {
    console.error("Outlook OAuth Token Exchange Error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
    return res.redirect(
      "https://campaign.shoppingsto.com/campaigns/new?error=oauth_failed"
    );
  }
});

// POST endpoint for Gmail OAuth (keep for backward compatibility)
router.post("/gmail/callback", async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
        redirect_uri: process.env.GMAIL_REDIRECT_URI!,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    console.log("Token response:", response.data);

    const tokens = response.data as GoogleTokenResponse;

    console.log("Exchanged tokens:", tokens);

    if (tokens.access_token) {
      // Get user email
      const userResponse = await axios.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }
      );
      const userInfo = userResponse.data as GoogleUserResponse;

      res.json({
        success: true,
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          email: userInfo.email,
        },
      });
    } else {
      res.json(tokens); // Return error from Google
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Token exchange failed" });
  }
});

/**
 * @swagger
 * /api/oauth/outlook/callback:
 *   post:
 *     summary: Exchange Outlook OAuth code for tokens
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Outlook OAuth authorization code
 *             required:
 *               - code
 *     responses:
 *       200:
 *         description: OAuth tokens exchanged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     expires_in:
 *                       type: number
 *       500:
 *         description: Failed to exchange code
 */
router.post("/outlook/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Authorization code is required",
      });
    }

    console.log("Outlook OAuth code received:", code);

    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      {
        client_id: process.env.OUTLOOK_CLIENT_ID,
        client_secret: process.env.OUTLOOK_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
        grant_type: "authorization_code",
        scope:
          "https://graph.microsoft.com/mail.read https://graph.microsoft.com/mail.send https://graph.microsoft.com/user.read",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tokenData = tokenResponse.data as MicrosoftTokenResponse;

    if (!tokenData.access_token) {
      throw new Error("No access token received from Microsoft");
    }

    // Get user profile to fetch email
    const userResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/me",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userData = userResponse.data as MicrosoftUserResponse;
    const email = userData.mail || userData.userPrincipalName;

    if (!email) {
      throw new Error(
        "Could not retrieve email address from Microsoft profile"
      );
    }

    res.json({
      success: true,
      data: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        email: email,
      },
    });
  } catch (error) {
    console.error("Outlook OAuth error:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to exchange Outlook code",
    });
  }
});

export default router;
