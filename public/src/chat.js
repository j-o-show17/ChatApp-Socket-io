const socket = io();

const messageForm = document.querySelector("#message-form");
const messageFormInput = messageForm.querySelector("input");
const messageFormButton = messageForm.querySelector("button");
const sendLocationBtn = document.querySelector("#send-location");
const messages = document.querySelector("#messages");


// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
let params = new URLSearchParams(document.location.search);
const username = params.get("username");
const room = params.get("room");

const scroll = () => {
    const newMessage = messages.lastElementChild;

    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    //Height
    const visibleHeight = messages.offsetHeight;

    // Height of messages container
    const containerHeight = messages.scrollHeight;

    // Scrool height
    const scrollOffset = messages.scrollTop + visibleHeight;
    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
};

socket.on("message", message => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    messages.insertAdjacentHTML("beforeend", html);
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });

    document.querySelector("#sidebar").innerHTML = html;
});

messageForm.addEventListener("submit", e => {
    e.preventDefault();

    messageFormButton.setAttribute("disabled", "disabled");

    const message = e.target.elements.message.value;

    socket.emit("sendMessage", message, error => {
        messageFormButton.removeAttribute("disabled");
        messageFormInput.value = "";
        messageFormInput.focus();

        if (error) {
            return console.log(error);
        } else {
            console.log("Message delivered!");
        }
    });
});

sendLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.");
    } else {
        sendLocationBtn.setAttribute("disabled", "disabled");

        navigator.geolocation.getCurrentPosition(position => {
            socket.emit(
                "sendLocation", {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                },
                error => {
                    sendLocationBtn.removeAttribute("disabled");
                    if (!error) {
                        console.log("Location shared!");
                    }
                }
            );
        });
    }
});

socket.emit("join", { username, room }, error => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});