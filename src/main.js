(() => {

    const startCam = async () => {
        const ifOn = (media) => {
            const videoEl = document.querySelector("video")
            videoEl.srcObject = media;
            videoEl.play();
        }
        const ifError = (msg) => alert(msg)
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' } // Prefer rear camera
        });
        stream ? ifOn(stream) : ifError("Falha ao iniciar câmera!")
    }

    /**
     * 
     * @param {number} tryTime Time to try scan a qrCode in seconds
     * @param {()} callback 
     */
    const scan = async (tryTime, callback) => {
        const timeout = () => alert("Tempo para escanear esgotado!")
        const t0 = new Date().getTime()
        const detector = new BarcodeDetector({ formats: ['qr_code'] })
        const video = document.querySelector('video')
        const code = await detector.detect(video)
        const t = new Date().getTime() - t0
        console.log((tryTime) - t)

        code && code.length > 0 ? callback(code[0].rawValue) :
            (tryTime <= 0) ? timeout() : requestAnimationFrame(() => scan(Number((tryTime) - t)));
    }

    const save = (text) => {
        const readsEl = document.querySelector("#reads")
        readsEl.innerText += `${text}\r\n`;
        const reads = readsEl.innerText
        localStorage.setItem("reads", reads)
    }

    const clear = () => {
        document.querySelector("#reads").innerText = ""
        localStorage.clear()
    }

    const copy = async () => {
        await navigator.clipboard.writeText(document.querySelector("#reads").innerText)
    }

    const getReads = () => localStorage.getItem("reads")

    function download(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.querySelector('#link');
        link.href = url;
        link.download = "leituras.txt"; // Sets the suggested filename
        link.click();
        URL.revokeObjectURL(url);
        link.href = ""
    }

    const init = () => {
        document.querySelector("#read").addEventListener("click", () => scan(10000, save))
        document.querySelector("#clear").addEventListener("click", clear)
        document.querySelector("#copy").addEventListener("click", copy)
        document.querySelector("#reads").innerText = getReads()
        document.querySelector("#download").addEventListener("click" , () => download(getReads()))
        startCam()
    }

    !window.BarcodeDetector ? window['BarcodeDetector'] = barcodeDetectorPolyfill.BarcodeDetectorPolyfill : 
    window.BarcodeDetector ? init() : document.body.innerHTML = "Está aplicação não funciona neste navegador!"

})()