import React from 'react';
import welcomeImage from '../../assets/welcome-girl.svg';

function WelcomeBanner({ userName }) {
    return (
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl text-white shadow-xl mb-8 relative overflow-hidden flex flex-col md:flex-row items-center min-h-[220px]">
            
            {/* Decoración Fondo */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-800 opacity-20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none"></div>

            {/* Contenedor de Texto */}
            {/* FIX: py-12 para dar aire arriba/abajo y z-10 para estar sobre el fondo */}
            <div className="relative z-10 flex-1 p-8 md:p-12 flex flex-col justify-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight leading-tight">
                    ¡Hola de nuevo, {userName}! 👋
                </h1>
                <p className="text-pink-100 text-lg leading-relaxed opacity-95 max-w-xl">
                    "El éxito es la suma de pequeños esfuerzos repetidos día tras día." 
                    <br/> <span className="font-semibold text-white">¡Vamos a romper récords de venta hoy! 🚀</span>
                </p>
                <div className="mt-6">
                    <button className="px-6 py-3 bg-white text-pink-600 font-bold rounded-xl shadow-lg hover:bg-pink-50 transition-all active:scale-95">
                        Ver Reportes
                    </button>
                </div>
            </div>

            {/* Ilustración */}
            <div className="hidden md:block relative z-10 w-64 h-full mr-8 flex-shrink-0 self-end">
                {/* La imagen se alinea al fondo para dar efecto 3D saliendo del banner */}
                <img 
                    src={welcomeImage} 
                    alt="Welcome" 
                    className="w-full h-48 object-contain drop-shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500" 
                    style={{ marginBottom: '-10px' }} // Truco visual para asentar la imagen
                />
            </div>
        </div>
    );
}

export default WelcomeBanner;