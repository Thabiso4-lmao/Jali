let bluetoothDevice;
let bluetoothServer;
let characteristic;

// Function to send commands to Arduino
function sendCommand(command) {
    if (!characteristic) {
        alert("Bluetooth not connected!");
        return;
    }
    let encoder = new TextEncoder();
    characteristic.writeValue(encoder.encode(command))
        .then(() => {
            document.getElementById("status").innerText = `Sent: ${command}`;
        })
        .catch(err => console.log(err));
}

// Connect to Bluetooth device
async function connectBluetooth() {
    try {
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['00001101-0000-1000-8000-00805f9b34fb'] }] // SPP UUID
        });
        bluetoothServer = await bluetoothDevice.gatt.connect();
        const service = await bluetoothServer.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb');
        characteristic = await service.getCharacteristic('00001101-0000-1000-8000-00805f9b34fb');
        document.getElementById("status").innerText = "Bluetooth connected!";
    } catch (err) {
        console.log(err);
        alert("Bluetooth connection failed!");
    }
}

// Voice recognition
const voiceBtn = document.getElementById("voiceBtn");
voiceBtn.addEventListener("click", () => {
    const language = document.getElementById("language").value;
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = language;
    recognition.start();

    recognition.onresult = function(event) {
        const command = event.results[0][0].transcript.toUpperCase();
        document.getElementById("status").innerText = `Voice Command: ${command}`;
        sendCommand(command);
    }

    recognition.onerror = function(event) {
        console.error(event.error);
        alert("Voice recognition error: " + event.error);
    }
});