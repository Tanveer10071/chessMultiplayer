
peers = {}
var rooms;
module.exports = (io) => {
    io.on('connect', (socket) => {
        console.log('a user is connected '+ socket.id);

        socket.on('create', function(room) {
            //console.log('create '+room);
            socket.join(room);
            // rooms= room;

             // Initiate the connection process as soon as the client connects

                peers[socket.id] = socket;

                
                // Asking all other clients to setup the peer connection receiver
                for(let id in peers) {
                    if(id === socket.id) continue
                    
                    socket_id = socket.id;
                    //console.log(socket_id);
                    peers[id].emit('initReceive', ({socket_id,room}))
                    //1
                }
        });

        //socket.on('message', (text) => io.emit('message', text));

        socket.on('message', ({room,text}) =>{
            socket.to(room).emit('message',{
                room,
                text
            });
        });

        socket.on('chessSendData', ({ selectedpiece, target ,room}) => {
            socket.to(room).emit('chessReceiveData',{
                selectedpiece,target
            });
            //io.emit('chessReceiveData', x)
        });
    

        // socket.on('message', (text) => io.emit('message', text));

        
        

        /**
         * Send message to client to initiate a connection
         * The sender has already setup a peer connection receiver
         */
        socket.on('initSend', init_socket_id => {
          //4
          console.log('initSend');
          console.log(init_socket_id);
            peers[init_socket_id].emit('initSend', socket.id)
            //5
        })

        /**
         * relay a peerconnection signal to a specific socket
         */
        socket.on('signal', data => {
          
            if(!peers[data.socket_id])return
            peers[data.socket_id].emit('signal', {
                socket_id: socket.id,
                signal: data.signal
            })
        })

        /**
         * remove the disconnected peer connection from all other connected clients
         */
        socket.on('disconnect', () => {
           
            socket.broadcast.emit('removePeer', socket.id)
            delete peers[socket.id]
            
        })

        

       

    });
}