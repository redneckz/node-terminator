module.exports = {
  'extends': ['airbnb-base'],
  'parserOptions': {
    'ecmaVersion': 2017,
  },
  'plugins': ['import'],
  'env': {
    'node': true,
    'jest': true,
  },
  'rules': {
    'no-use-before-define': ['error', { 'functions': false }]
  },
};
