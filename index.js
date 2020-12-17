// exports.getDate = function() {
//     let today = new Date();
//     let options = {
//         weekday: 'long',
//         // year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//     };
    
//     return date = today.toLocaleDateString("en-US", options);
// }

exports.getDate = function(today) {
    let options = {
        weekday: 'long',
        // year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    return date = today.toLocaleDateString("en-US", options);
}