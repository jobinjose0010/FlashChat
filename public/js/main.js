const socket = io('http://localhost:4000');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

var roomname = document.getElementById("roominput").value;

const name = prompt("What is your Name?");
appendMessge('You joined.');
socket.emit('new-user',{name:name,room:roomname}); 

socket.on('chat-message',data =>{
    appendMessge(`${data.name}: ${data.message}`);
});

socket.on('user-connected',name =>{
    appendMessge(`${name} connected`);
});

socket.on('user-disconnect',name =>{
    appendMessge(`${name} disconnected`);
});

messageForm.addEventListener('submit',e =>{
    e.preventDefault();
    const message = messageInput.value;
    socket.emit('send-chat-message',message);
    appendMessge(`you: ${message}`)
    messageInput.value = '';
})

function appendMessge(message){
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}