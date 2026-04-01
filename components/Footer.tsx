export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="w-full px-6 py-5"
      style={{
        backgroundColor: 'rgba(4, 7, 13, 0.8)',
        borderTop: '1px solid rgba(74, 171, 120, 0.15)',
      }}
    >
      {/* Disclaimer */}
      <p
        className="text-center text-xs leading-relaxed max-w-3xl mx-auto"
        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
      >
        Las respuestas tienen carácter exclusivamente informativo y no constituyen asesoramiento
        jurídico o fiscal profesional. Consulte siempre con un profesional colegiado habilitado
        para el ejercicio de la abogacía o asesoría fiscal.
      </p>

      {/* Divider */}
      <div
        className="my-3 mx-auto max-w-xs h-px"
        style={{ backgroundColor: 'rgba(74, 171, 120, 0.2)' }}
        aria-hidden="true"
      />

      {/* Copyright */}
      <p
        className="text-center text-xs"
        style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          opacity: 0.6,
          fontSize: '0.6875rem',
        }}
      >
        © {new Date().getFullYear()} JUNO
      </p>
    </footer>
  );
}
