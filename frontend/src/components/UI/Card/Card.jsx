import "./Card.scss"

const Card = ({ children, className = "", padding = true, shadow = true, ...props }) => {
  const cardClass = `
    card 
    ${padding ? "card--padded" : ""} 
    ${shadow ? "card--shadow" : ""} 
    ${className}
  `.trim()

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  )
}

const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`card__header ${className}`} {...props}>
    {children}
  </div>
)

const CardBody = ({ children, className = "", ...props }) => (
  <div className={`card__body ${className}`} {...props}>
    {children}
  </div>
)

const CardFooter = ({ children, className = "", ...props }) => (
  <div className={`card__footer ${className}`} {...props}>
    {children}
  </div>
)

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
