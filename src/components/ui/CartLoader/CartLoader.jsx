import React from 'react';
import './CartLoader.css'; // Importamos los estilos

const CartLoader = () => {
    return (
        <div className="cart-loader-container">
            <svg 
                className="cart-svg" 
                role="img" 
                aria-label="Shopping cart line animation" 
                viewBox="0 0 128 128" 
                width="128px" 
                height="128px" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8">
                    {/* Riel / Estructura base */}
                    <g className="cart__track">
                        <polyline points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80" />
                        <circle cx="43" cy="111" r="13" />
                        <circle cx="102" cy="111" r="13" />
                    </g>
                    
                    {/* Líneas Animadas (Color Rosa) */}
                    <g className="cart__lines">
                        <polyline 
                            className="cart__top" 
                            points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80" 
                            strokeDasharray="338 338" 
                            strokeDashoffset="-338" 
                        />
                        <g className="cart__wheel1">
                            <circle 
                                className="cart__wheel-stroke" 
                                cx="43" 
                                cy="111" 
                                r="13" 
                                strokeDasharray="81.68 81.68" 
                                strokeDashoffset="81.68" 
                            />
                        </g>
                        <g className="cart__wheel2">
                            <circle 
                                className="cart__wheel-stroke" 
                                cx="102" 
                                cy="111" 
                                r="13" 
                                strokeDasharray="81.68 81.68" 
                                strokeDashoffset="81.68" 
                            />
                        </g>
                    </g>
                </g>
            </svg>

            {/* Texto debajo del loader */}
            <div className="mt-2 text-pink-500 font-bold text-xs tracking-widest uppercase animate-pulse">
                Cargando Sistema...
            </div>
        </div>
    );
};

export default CartLoader;