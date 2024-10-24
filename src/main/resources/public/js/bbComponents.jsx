const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Editor name="Ricardo" />
);

function BBCanvas() {
    const [svrStatus, setSvrStatus] = React.useState({
        loadingState: 'Loading Canvas...'
    });
    const comunicationWS = React.useRef(null);
    const myp5 = React.useRef(null);
    
    const sketch = function (p) {
        p.setup = function () {
            p.createCanvas(700, 410);
        }
        p.draw = function () {
            if (p.mouseIsPressed) {
                p.fill(0, 0, 0);
                p.ellipse(p.mouseX, p.mouseY, 20, 20);
                comunicationWS.current.send(p.mouseX, p.mouseY);
            } else {
                p.fill(255, 255, 255);
            }
        }
    };

    React.useEffect(() => {
        myp5.current = new p5(sketch, 'container');
        setSvrStatus({ loadingState: 'Canvas Loaded' });
        comunicationWS.current = new WSBBChannel(BBServiceURL(), (msg) => {
            var obj = JSON.parse(msg);
            console.log("On func call back ", msg);
            drawPoint(obj.x, obj.y);
        });
        return () => {
            console.log('Closing connection ...');
            comunicationWS.current.close();
        };
    }, []);

    function drawPoint(x, y) {
        myp5.current.ellipse(x, y, 20, 20);
    }

    return (
        <div>
            <h4>Drawing status: {svrStatus.loadingState}</h4>
        </div>
    );
}

function Editor({ name }) {
    return (
        <div>
            <h1>Hello, Mr. {name}</h1>
            <hr />
            <div id="toolstatus"></div>
            <hr />
            <div id="container">
                <BBCanvas />
            </div>
            <hr />
            <div id="info"></div>
        </div>
    );
}

// Returns the service URL. It's a configuration function.
function BBServiceURL() {
    var host = window.location.host;
    console.log("Host: " + host);
    var url = 'ws://' + host + '/bbService';
    console.log("Calculated URL: " + url);
    return url;
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
        // Ignore the first message from the server
        if (evt.data !== "Connection established.") {
            this.receivef(evt.data);
        }
    }

    onError(evt) {
        console.error("In onError", evt);
    }

    send(x, y) {
        let msg = '{ "x": ' + (x) + ', "y": ' + (y) + "}";
        console.log("sending: ", msg);
        this.wsocket.send(msg);
    }
}
