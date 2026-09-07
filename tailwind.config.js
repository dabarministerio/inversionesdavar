/** Tailwind configuration reference for future build integration.
 * The current review build uses assets/css/tailwind.css as the compiled local stylesheet.
 */
module.exports = {
  content: ['./**/*.html','./assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        davarPrimary: '#10192A',
        davarSecondary: '#C59854',
        davarComplement: '#F1D28F',
        davarText: '#2c2c2c'
      },
      transitionTimingFunction: {
        'davar-enter': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'davar-exit': 'cubic-bezier(0.4, 0.0, 1, 1)',
        'davar-move': 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      }
    }
  }
};
