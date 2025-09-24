import Imap from 'imap';
const POP3Client = require('poplib');
import { simpleParser } from 'mailparser';
import { prisma } from '../config/database';

export class EmailReceiver {
  private imap: Imap;

  constructor(config: {
    user: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
  }) {
    this.imap = new Imap({
      ...config,
      connTimeout: 10000,
      authTimeout: 10000,
      keepalive: false
    });
  }

  async fetchEmails(senderId: string) {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        console.log('IMAP connected successfully');
        
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) return reject(err);

          this.imap.search(['UNSEEN'], (err, results) => {
            if (err) return reject(err);
            
            console.log(`Found ${results.length} unread emails`);
            if (!results.length) {
              this.imap.end();
              return resolve([]);
            }

            // Limit to first 5 emails to avoid timeout
            const limitedResults = results.slice(0, 5);
            console.log(`Processing ${limitedResults.length} emails`);
            
            const fetch = this.imap.fetch(limitedResults, { bodies: '' });
            const emails: any[] = [];
            let processed = 0;

            fetch.on('message', (msg) => {
              msg.on('body', (stream: any) => {
                simpleParser(stream as any, (err: any, parsed: any) => {
                  if (!err) {
                    emails.push({
                      from: parsed.from?.text,
                      subject: parsed.subject,
                      text: parsed.text,
                      html: parsed.html,
                      date: parsed.date,
                      senderId
                    });
                  }
                  processed++;
                  if (processed === limitedResults.length) {
                    this.imap.end();
                    resolve(emails);
                  }
                });
              });
            });

            fetch.once('end', () => {
              setTimeout(() => {
                this.imap.end();
                resolve(emails);
              }, 1000);
            });
          });
        });
      });

      this.imap.once('error', (err: any) => {
        console.log('IMAP connection error:', err.message);
        reject(err);
      });
      
      console.log('Attempting IMAP connection...');
      
      this.imap.connect();
    });
  }
}

const fetchPOP3Emails = async (config: any, senderId: string) => {
  return new Promise((resolve, reject) => {
    const client = new POP3Client(config.port, config.host, {
      tlsconnect: config.tls,
      enabletls: config.tls
    });

    client.on('connect', () => {
      console.log('POP3 connected successfully');
      client.login(config.user, config.password);
    });

    client.on('login', (status: boolean) => {
      if (status) {
        client.list();
      } else {
        reject(new Error('POP3 login failed'));
      }
    });

    client.on('list', (status: boolean, msgcount: number) => {
      if (status && msgcount > 0) {
        const emails: any[] = [];
        let processed = 0;
        const limit = Math.min(msgcount, 5);
        
        for (let i = 1; i <= limit; i++) {
          client.retr(i);
        }
        
        client.on('retr', (status: boolean, msgnumber: number, data: string) => {
          if (status) {
            simpleParser(data, (err: any, parsed: any) => {
              if (!err) {
                emails.push({
                  from: parsed.from?.text,
                  subject: parsed.subject,
                  text: parsed.text,
                  html: parsed.html,
                  date: parsed.date,
                  senderId
                });
              }
              processed++;
              if (processed === limit) {
                client.quit();
                resolve(emails);
              }
            });
          }
        });
      } else {
        client.quit();
        resolve([]);
      }
    });

    client.on('error', (err: any) => {
      console.log('POP3 connection error:', err.message);
      reject(err);
    });
  });
};

export const checkEmails = async (sender: any) => {
  if (sender.provider === 'IMAP') {
    const imapHost = sender.imapHost || 
      (sender.email.includes('@luisantsoftwares.com') ? 'imap.secureserver.net' : 'imap.gmail.com');
    const imapPort = sender.imapPort || 
      (sender.email.includes('@luisantsoftwares.com') ? 993 : 993);

    const config = {
      user: sender.email,
      password: sender.password,
      host: imapHost,
      port: imapPort,
      tls: true
    };
    
    console.log('IMAP Config:', { ...config, password: '***' });
    
    const receiver = new EmailReceiver(config);

    try {
      const emails = await receiver.fetchEmails(sender.id) as any[];
      return { success: true, emails, count: emails.length };
    } catch (error: any) {
      console.error('IMAP fetch error:', error);
      return { success: false, error: error?.message || 'Unknown error', emails: [] };
    }
  } else if (sender.provider === 'POP3') {
    const popHost = sender.popHost || 
      (sender.email.includes('@luisantsoftwares.com') ? 'pop.secureserver.net' : 'pop.gmail.com');
    const popPort = sender.popPort || 
      (sender.email.includes('@luisantsoftwares.com') ? 995 : 995);

    const config = {
      user: sender.email,
      password: sender.password,
      host: popHost,
      port: popPort,
      tls: true
    };
    
    console.log('POP3 Config:', { ...config, password: '***' });

    try {
      const emails = await fetchPOP3Emails(config, sender.id) as any[];
      return { success: true, emails, count: emails.length };
    } catch (error: any) {
      console.error('POP3 fetch error:', error);
      return { success: false, error: error?.message || 'Unknown error', emails: [] };
    }
  }
  return { success: false, error: 'Not an IMAP/POP3 sender', emails: [] };
};