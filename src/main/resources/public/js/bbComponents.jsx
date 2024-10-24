// BBComponents.jsx
const { useState, useEffect, useRef } = React;

function BBCanvas() {
    const [svrStatus, setSvrStatus] = useState({
        loadingState: 'Loading Canvas...'
    });
    const comunicationWS = useRef(null);
    const myp5 = useRef(null);
    
    const sketch = function (p) {
        p.setup = function () {
            p.createCanvas(700, 410);
            p.background(255);
        }
        
        p.draw = function () {
            if (p.mouseIsPressed) {
                p.fill(0);
                p.noStroke();
                p.ellipse(p.mouseX, p.mouseY, 20, 20);
                if (comunicationWS.current) {
                    comunicationWS.current.send(p.mouseX, p.mouseY);
                }
            }
        }
    };

    useEffect(() => {
        // Asegurarse que el contenedor existe antes de crear el canvas
        const container = document.getElementById('container');
        if (!container) return;

        myp5.current = new p5(sketch, container);
        setSvrStatus({ loadingState: 'Canvas Loaded' });
        
        try {
            comunicationWS.current = new WSBBChannel(BBServiceURL(), (msg) => {
                const obj = JSON.parse(msg);
                console.log("On func call back ", msg);
                if (myp5.current) {
                    drawPoint(obj.x, obj.y);
                }
            });
        } catch (error) {
            console.error("Error initializing WebSocket:", error);
            setSvrStatus({ loadingState: 'Error connecting to server' });
        }

        return () => {
            console.log('Cleaning up...');
            if (comunicationWS.current) {
                comunicationWS.current.close();
            }
            if (myp5.current) {
                myp5.current.remove();
            }
        };
    }, []);

    function drawPoint(x, y) {
        if (myp5.current) {
            myp5.current.fill(0);
            myp5.current.noStroke();
            myp5.current.ellipse(x, y, 20, 20);
        }
    }

    return (
        <div>
            <h4>Drawing status: {svrStatus.loadingState}</h4>
        </div>
    );
}

function Editor({ name }) {
    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Hello, Mr. {name}</h1>
            <hr className="my-4" />
            <div id="toolstatus"></div>
            <hr className="my-4" />
            <div id="container"></div>
            <hr className="my-4" />
            <div id="info"></div>
        </div>
    );
}

class WSBBChannel {
    constructor(URL, callback) {
        this.URL = URL;
        this.wsocket = new WebSocket(URL);
        this.wsocket.onopen = (evt) => this.onOpen(evt);
        this.wsocket.onmessage = (evt) => this.onMessage(evt);
        this.wsocket.onerror = (evt) => this.onError(evt);
        this.receivef = callback;
    }

    onOpen(evt) {
        console.log("In onOpen", evt);
    }

    onMessage(evt) {
        console.log("In onMessage", evt);
        if (evt.data !== "Connection established.") {
            this.receivef(evt.data);
        }
    }

    onError(evt) {
        console.error("In onError", evt);
    }

    send(x, y) {
        const msg = JSON.stringify({ x, y });
        console.log("sending: ", msg);
        this.wsocket.send(msg);
    }

    close() {
        if (this.wsocket) {
            this.wsocket.close();
        }
    }
}

function BBServiceURL() {
    const host = window.location.host;
    console.log("Host: " + host);
    const url = `ws://${host}/bbService`;
    console.log("Calculated URL: " + url);
    return url;
}

// Función de inicialización que se llamará cuando el documento esté listo
function initBBComponents() {
    const rootElement = document.getElementById("root");
    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(<Editor name="Ricardo" />);
        console.log("BB Components initialized");
    } else {
        console.error("Root element not found");
    }
}

// Agregar la función al objeto window para poder llamarla desde el HTML
window.initBBComponents = initBBComponents;