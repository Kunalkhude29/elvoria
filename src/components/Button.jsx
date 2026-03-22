import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    onClick,
    disabled = false,
    type = 'button',
    icon,
    className = ''
}) => {
    const buttonClass = `
    btn
    btn--${variant}
    btn--${size}
    ${fullWidth ? 'btn--full-width' : ''}
    ${disabled ? 'btn--disabled' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <button
            type={type}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <span className="btn__icon">{icon}</span>}
            <span className="btn__text">{children}</span>
        </button>
    );
};

export default Button;
