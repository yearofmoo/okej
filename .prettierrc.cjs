module.exports = {
  plugins: [require.resolve("@trivago/prettier-plugin-sort-imports")],

  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,

  trailingComma: "all",
  tabWidth: 2,
  semi: true,
  singleQuote: false,
};
