const purgecss = require('@fullhuman/postcss-purgecss')({
  content: ['index.html'],
  // ignore any --is- modifier class and table-row-borders
  whitelistPatterns: [/--is-/, /table-row-border.*/],

  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
});

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
  ],
};
