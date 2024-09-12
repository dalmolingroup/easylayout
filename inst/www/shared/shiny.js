// mock
Shiny = {
    setInputValue: (input, value) => {
        console.log(`Mock: setInputValue(${input}, ${value})`);
    },
    addCustomMessageHandler: (message, callback) => {
        console.log(`Mock: addCustomMessageHandler(${message}, ${callback})`);
        callback("whatever");
    },
};