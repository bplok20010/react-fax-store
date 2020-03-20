module.exports = function() {
    return {
        babel: {
            plugins: [
                [
                    "babel-plugin-transform-react-remove-prop-types",
                    { mode: "wrap" },
                ],
            ],
        },
    };
};
