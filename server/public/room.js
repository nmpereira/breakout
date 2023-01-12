console.log("Room ID: " + ROOM_ID);
const videoGrid = document.getElementById("video-grid");
const peer = new Peer(undefined, {
  //   host: "/",
  //   port: "3001",
  debug: 3,
});

const socket = io("/");
const myVideo = document.createElement("video");
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

navigator.permissions
  .query({ name: "microphone" })
  .then((permissionObj) => {
    console.log(permissionObj.state);
  })
  .catch((error) => {
    console.log("Got error :", error);
  });

navigator.permissions
  .query({ name: "camera" })
  .then((permissionObj) => {
    console.log(permissionObj.state);
  })
  .catch((error) => {
    console.log("Got error :", error);
  });

socket.on("user-disconnected", (message) => {
  console.log("User disconnected: " + message);
});

peer.on("open", function (id) {
  socket.emit("join-room", ROOM_ID, id);
  console.log("My peer ID is: " + id);
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
}
