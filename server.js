const express = require('express');
const socket = require('socket.io');
const path = require('path');


const app = express();

app.use(express.static(path.join(__dirname, '/client')));


const tasks = [];

const server = app.listen(process.env.PORT || 8000, () => {
    console.log('Server is running on port: 8000');
});

const io = socket(server);

io.on('connection', (socket) => {
    console.log('New client! Its id – ' + socket.id);
    console.log(tasks);
    io.to(socket.id).emit('updateData', JSON.stringify(tasks));

    socket.on('addTask', (task) => {
        console.log('Oh, I\'ve got something from ' + socket.id);
        tasks.push(task);
        socket.broadcast.emit('addTask', task);
    });

    socket.on('removeTask', (taskId) => {
        const indexToRemove = tasks.findIndex((task) => task.id === taskId);

        if (indexToRemove !== -1) {
            const removedTask = tasks.splice(indexToRemove, 1)[0];
            console.log('Removed task:', removedTask);
            socket.broadcast.emit('removeTask', taskId);
        }
    });

    socket.on('editTask', (id, newName) => {
        const taskToEdit = tasks.find((task) => task.id === id);
        if (taskToEdit) {
            taskToEdit.name = newName;
            socket.broadcast.emit('editTask', id, newName);

        }
    });

});


app.use((req, res) => {
    res.status(404).send('404 not found...');
});

