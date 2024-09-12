// mock
jQuery = (selector) => {
    return {
        on: (event, callback) => {
            console.log(`Mock: jQuery(el).on(${event}, ${callback})`);
            callback();
        },
    };
}