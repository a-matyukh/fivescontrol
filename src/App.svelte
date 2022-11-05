<svelte:head>
    <title>5SControl.com</title>
</svelte:head>
<header>
    <span><b>5SControl.com</b></span>
    <span><strong>Triggers</strong></span>
    <span>Assets</span>
    <span>Workers</span>
    <span>Outfits</span>
    <span>Instructions</span>
    <span on:contextmenu|preventDefault={() => isShowDebug = !isShowDebug}>Your profile</span>
</header>
<main>
    <article>
        <p id="manuf_cam">Cam 1: Anchor Assembly Factory</p>
        <div id="videoContainer">
            <canvas {width} {height} id="myCanvas"></canvas>
        </div>
    </article>
    <aside>
      <div>
          <h3>Operation "Anchor unwinding"</h3>
          <ul>
              <li class:completed={isHandsVisible && eventSequence.accumulated.includes("0")}>1. {eventNames["0"]}</li>
              <li class:completed={isHandsVisible && eventSequence.accumulated.includes("1")}>2. {eventNames["1"]}</li>
              <li class:completed={isHandsVisible && eventSequence.accumulated.includes("2")}>3. {eventNames["2"]}</li>
          </ul>
      </div>
        <span>Operations performed: {JSON.stringify(eventSequence.counter)}</span>
        {#if isHandsVisible && ["0", "1", "2"].includes(eventSequence.currentLabel)}
            <p>
                <span>Progress of the current operation: {JSON.stringify(eventSequence.percent)}%</span>
            </p>
        {/if}
        <p class:red="{isHandsVisible && eventSequence.currentLabel === "3"}"><strong>Worker with phone</strong></p>
        <p class:red="{[0, "nothing"].includes(outfitResult)}"><strong>Worker without helmet</strong></p>
    </aside>
</main>

<section class:isShowDebug>
    <details open>
        <summary>Events</summary>
        <h4>
            Current event: <span id="result">...</span>
            <br>
            with a confidence of <span id="confidence">...</span>
        </h4>
        <h5>
            Event Sequence (steps ot template/operation)
            <br>
            <span>needed: {JSON.stringify(eventSequence.needed)},</span>
            <span>recorded: {JSON.stringify(eventSequence.recorded)}.</span>
        </h5>
        <hr>
        <div>
            <button id="buttonPredict">Update classifier</button>
            <button id="clearAll">Clear all classes</button>
            <button id="saveKNNButton">Save</button>
            <button id="loadKNNbutton">Load</button>
        </div>
        <hr>
        <p>
            <strong>0: {eventNames["0"]}</strong><br><br>
            <button id="addClassA">Add an example</button>
            <small><span id="exampleA">0</span> examples</small>
            <button id="resetA">Reset</button>
            · <small>Confidence in A is: <span id="confidenceA">0</span></small>
        </p>
        <hr>
        <p>
            <strong>1: {eventNames["1"]}</strong><br><br>
            <button id="addClassB">Add an example</button>
            <small><span id="exampleB">0</span> examples</small>
            <button id="resetB">Reset</button>
            · <small>Confidence in B is: <span id="confidenceB">0</span></small>
        </p>
        <hr>
        <p>
            <strong>2: {eventNames["2"]}</strong><br><br>
            <button id="addClassC">Add an example</button>
            <small><span id="exampleC">0</span> examples</small>
            <button id="resetC">Reset</button>
            · <small>Confidence in C is: <span id="confidenceC">0</span></small>
        </p>
        <hr>
        <p>
            <strong>3: {eventNames["3"]}</strong><br><br>
            <button id="addClassD">Add an example</button>
            <small><span id="exampleD">0</span> examples</small>
            <button id="resetD">Reset</button>
            · <small>Confidence in D is: <span id="confidenceD">0</span></small>
        </p>
        <hr>
        <p>
            <strong>4: {eventNames["4"]}</strong><br><br>
            <button id="addClassE">Add an example</button>
            <small><span id="exampleE">0</span> examples</small>
            <button id="resetE">Reset</button>
            · <small>Confidence in E is: <span id="confidenceE">0</span></small>
        </p>
    </details>
</section>

<style>
header {
    display: flex;
    justify-content: space-around;
    padding: 15px;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
    user-select: none;
}
header > span {
    color: gray;
}
header b {
    color: CadetBlue;
}
header strong {
    color: black;
}
main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 20px 10px;
    user-select: none;
}
#manuf_cam {
    width: 640px;
    margin: 0;
    padding: 5px;
    box-sizing: border-box;
    color: #f5f5f5;
    font-size: small;
    text-transform: uppercase;
    background-color: dimgray;
}
ul {
    font-size: 24px;
    padding: 10px;
}
ul > li {
    margin: 10px;
    color: #ccc;
}
li.completed {
    color: green;
}
h4 {
    color: #ccc;
}
h4 > span {
    color: black;
}
h3 {
    font-weight: bold;
}
section {
    position: fixed;
    height: 90vh;
    top: 30px;
    right: 20px;
    padding: 10px;
    background-color: #fff;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
    overflow: auto;
    transition: .3s;
}
section.isShowDebug {
    right: -90vw;
}
p.red {
    color: red;
}
</style>
<script>
import { onMount } from "svelte"
import { setTrigger } from "./firebase";
import { io } from "socket.io-client"

const socket = io('https://easylang.ml', { transports : ['websocket']});


const width = 640
const height = 480
let isShowDebug = true

let timeWithPhone = {
    without: 2,
    with: 1
}
let timeWithHelmet = {
    without: 4,
    with: 2
}
setInterval(() => {
    if (isHandsVisible && eventSequence.currentLabel === "3") {
        timeWithPhone.with += 0.1
        // setTrigger("productivity", { data: false, productivity: false })
        socket.emit('productivity', {data: false, productivity: false})
        
    } else {
        timeWithPhone.without += 0.1
        // setTrigger("productivity", { data: true, productivity: true })
        socket.emit('productivity', {data: true, productivity: true})
    }
    if ([0, "nothing"].includes(outfitResult)) {
        timeWithHelmet.without += 0.1
        // setTrigger("safety", { data: false, safety: false })
        socket.emit('safety', {data: false, safety: false})
    } else {
        timeWithHelmet.with += 0.1
        // setTrigger("safety", { data: true, safety: true })
        socket.emit('safety', {data: true, safety: true})
    }
    // getEvents(db)
}, 2000)

let eventNames = {
    0: "Take the anchor", // Взять анкер в руки (левой рукой)
    1: "Unwind the anchor", // Раскрутить анкер (правой рукой)
    2: "Dismantle anchor pieces", // Разъеденить части анкера (части анкера разведены в разных руках)
    3: "Worker standing with phone", // стоит с телефоном (в правой руке)
    4: "не нужное событие",
}

let currentStep = ""
let isHandsVisible = false
let eventSequence = {
    needed: ["0", "1", "2"],
    recorded: [],
    currentLabel: 0,
    
    accumulated: [],
    percent: 0,

    scoreTreshold: 0.9,
    counter: 0,
    increased: false,

    coincidences: 0,
    isAccumulation: true,
    progress: 0,
    record(label) {
        this.currentLabel = label
        const lastI = this.recorded.length - 1
        if (this.recorded[lastI] !== label) {
            this.recorded.push(label)
        }
        if (this.recorded.length > this.needed.length) {
            this.recorded.shift()
        }
        this.check()

        if (label === "0" && this.accumulated.length === 0) {
            this.accumulated = ["0"]
            this.percent = 33
        } else if (label === "1" && this.accumulated.length === 1) {
            this.accumulated = ["0", "1"]
            this.percent = 66
        } else if (label === "2" && this.accumulated.length === 2) {
            this.accumulated = ["0", "1", "2"]
            this.percent = 100
            setTimeout(() => {
                this.accumulated = []
                this.percent = 0
            }, 1000)
        }
        else if (["3", "4"].includes(label)) {
            this.accumulated = []
            this.percent = 0
        }
        // setTrigger("process", { count: this.counter, progress: this.percent })
        socket.emit('process', {count: this.counter, progress: this.percent})


    },
    check() {
        if (JSON.stringify(this.needed) === JSON.stringify(this.recorded)) {
            if (!this.increased) {
                this.counter++
                this.increased = true
            }
        } else {
            this.increased = false
        }
    },
    setProgress() {
        if (this.needed[0] !== this.recorded[this.recorded.length - 1]) {
            this.coincidences = 0
            this.progress = 0
        } else {
            const bufferedArray = [...this.recorded]
            const reversedRecorded = bufferedArray.reverse()
            for (let i = 0; i < reversedRecorded.length; i++) {
                if (reversedRecorded[i] === this.needed[i]) {
                    this.coincidences++
                }
            }
            if (this.coincidences > 0) {
                this.progress = (this.coincidences / this.needed.length).toFixed(2) * 100
            }
        }
    }
}

// $: if (!isHandsVisible) eventSequence.percent = 0

let featureExtractor, outfitClassifier
let MNloading = "", videoStatus = ""
let totalLoss = 0, lossStatus = ""
let outfitResult = "", outfitConfidence = ""
let loadButton
let outfits = {
    "helmet": {
        label: "helmet",
        eventName: "Worker with helmet",
        images: 0
    },
    "nothing": {
        label: "nothing",
        eventName: "Nothing",
        images: 0
    }        
}
function addImageToLabel(label) {
    outfitClassifier.addImage(label)
    outfits[label].images++
}
async function train() {
    outfitClassifier.train(lossValue => {
        if (lossValue) {
            totalLoss = lossValue
            lossStatus = `Loss: ${totalLoss}`
        } else {
            lossStatus = `Done Training! Final Loss: ${totalLoss}`
        }
    })
}
function predict() {
    outfitClassifier.classify(gotOutfitResults)
}
function MNLoaded() {
    MNloading = "MobileNet loaded!"
}
function videoReady() {
    videoStatus = "Video ready!"
}
function gotOutfitResults(err, results) {
    if (err) console.error(err)
    if (results && results[0]) {
        outfitResult = results[0].label
        outfitConfidence = results[0].confidence
        outfitClassifier.classify(gotOutfitResults)
    }
}
function saveOutfits() {
    outfitClassifier.save()
}
async function loadOutfits() {
    // await outfitClassifier.load("./my_outfits/model.json", function() {console.log('Outfit model loaded!')})
    await outfitClassifier.load("./model.json", function() {console.log('Outfit model loaded!')})
}

onMount(() => {

    let video
    let canvas
    let ctx
    let buttonA, buttonB, resetBtnA, resetBtnB, buttonPredict, buttonClearAll, saveKNNButton, loadKNNbutton
    let buttonC, resetBtnC
    let buttonD, resetBtnD
    let buttonE, resetBtnE

    const knnClassifier = ml5.KNNClassifier()
    let handPoses = []

    const hands = new Hands({locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`})
    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
    });
    hands.onResults(onMPResults)
    function onMPResults(results) {

        ctx.save()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

        if (results.multiHandLandmarks) {
            handPoses = results.multiHandLandmarks
            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5})
                drawLandmarks(ctx, landmarks, {color: '#FF0000', lineWidth: 2})
            }
            if (handPoses.length === 0) {
                isHandsVisible = false
            } else {
                isHandsVisible = true
            }
        }

        ctx.restore()
    }

    async function getVideo() {
        const videoElement = document.createElement("video")
        videoElement.setAttribute("style", "display: none;")
        videoElement.width = width
        videoElement.height = height
        document.body.appendChild(videoElement)

        const capture = await navigator.mediaDevices.getUserMedia({ video: true })
        videoElement.srcObject = capture
        videoElement.play()

        return videoElement
    }
    function createButtons() {

        buttonA = document.querySelector("#addClassA")
        buttonA.addEventListener("click", () => addExample("0"))
        buttonB = document.querySelector("#addClassB")
        buttonB.addEventListener("click", () => addExample("1"))
        buttonC = document.querySelector("#addClassC")
        buttonC.addEventListener("click", () => addExample("2"))
        buttonD = document.querySelector("#addClassD")
        buttonD.addEventListener("click", () => addExample("3"))
        buttonE = document.querySelector("#addClassE")
        buttonE.addEventListener("click", () => addExample("4"))

        resetBtnA = document.querySelector("#resetA")
        resetBtnA.addEventListener("click", () =>  clearLabel("0"))
        resetBtnB = document.querySelector("#resetB")
        resetBtnB.addEventListener("click", () => clearLabel("1"))
        resetBtnC = document.querySelector("#resetC")
        resetBtnC.addEventListener("click", () => clearLabel("2"))
        resetBtnD = document.querySelector("#resetD")
        resetBtnD.addEventListener("click", () => clearLabel("3"))
        resetBtnE = document.querySelector("#resetE")
        resetBtnE.addEventListener("click", () => clearLabel("4"))

        buttonPredict = document.querySelector("#buttonPredict")
        buttonPredict.addEventListener("click", classify)

        buttonClearAll = document.querySelector("#clearAll")
        buttonClearAll.addEventListener("click", clearAllLabels)

        saveKNNButton = document.querySelector("#saveKNNButton")
        saveKNNButton.addEventListener("click", saveMyKNN)
        loadKNNbutton = document.querySelector("#loadKNNbutton")
        loadKNNbutton.addEventListener("click", loadMyKNN)

    }
    async function draw() {
        requestAnimationFrame(draw)
        ctx.drawImage(video, 0, 0, width, height)
        updateSvelteRender()
    }
    async function init() {

        canvas = document.querySelector("#myCanvas")
        ctx = canvas.getContext("2d")
        video = await getVideo()
        createButtons()

        const camera = new Camera(video, {
            onFrame: async () => await hands.send({image: video}),
            width,
            height
        })
        camera.start()

        requestAnimationFrame(draw)

        featureExtractor = ml5.featureExtractor("MobileNet", MNLoaded)
        outfitClassifier = featureExtractor.classification(video, videoReady)

        loadMyKNN()
        await loadOutfits()
        predict()
        

    }
    init()


    function addExample(label) {
        let poseArray = handPoses[0].map(p => [p.x, p.y])
        knnClassifier.addExample(poseArray, label)
        updateCounts()
    }
    function clearLabel(classLabel) {
        knnClassifier.clearLabel(classLabel)
        updateCounts()
    }
    function clearAllLabels() {
        knnClassifier.clearAllLabels()
        updateCounts()
    }
    function updateCounts() {
        const counts = knnClassifier.getCountByLabel()
        document.querySelector("#exampleA").textContent = counts["0"] || 0
        document.querySelector("#exampleB").textContent = counts["1"] || 0
        document.querySelector("#exampleC").textContent = counts["2"] || 0
        document.querySelector("#exampleD").textContent = counts["3"] || 0
        document.querySelector("#exampleE").textContent = counts["4"] || 0
    }


    function classify() {
        const numLabels = knnClassifier.getNumLabels()
        if (numLabels <= 0) {
            console.error("There is no examples in any label")
            return
        }
        if (handPoses[0]) {
            const poseArray = handPoses[0].map(p => [p.x, p.y])
            if (poseArray) knnClassifier.classify(poseArray, gotResults)
        } else {
            setTimeout(() => {
                buttonPredict.click()
            }, 1000)
        }
    }
    function gotResults(err, result) {
        if (err) console.error(err)
        if (result && result.confidencesByLabel) {
            const confidences = result.confidences
            if (result.label) {

                currentStep = result.label

                document.querySelector("#result").textContent = `${result.label}. ${eventNames[result.label]}`
                document.querySelector("#confidence").textContent = `${confidences[result.label] * 100} %`
                
                document.querySelector("#confidenceA").textContent = `${confidences["0"] ? confidences["0"].toFixed(2) * 100 : 0} %`
                document.querySelector("#confidenceB").textContent = `${confidences["1"] ? confidences["1"].toFixed(2) * 100 : 0} %`
                document.querySelector("#confidenceC").textContent = `${confidences["2"] ? confidences["2"].toFixed(2) * 100 : 0} %`
                document.querySelector("#confidenceD").textContent = `${confidences["3"] ? confidences["3"].toFixed(2) * 100 : 0} %`
                document.querySelector("#confidenceE").textContent = `${confidences["4"] ? confidences["4"].toFixed(2) * 100 : 0} %`

                if (confidences[result.label] > eventSequence.scoreTreshold) {
                    eventSequence.record(result.label)
                }

                classify()

            }
        }
    }


    function saveMyKNN() {
        knnClassifier.save('myKNN')
    }
    function loadMyKNN() {
        knnClassifier.load('/myKNN.json', () => {
            updateCounts()
            classify()
        })
    }



    function updateSvelteRender() {
        eventSequence.recorded = eventSequence.recorded
    }






})



</script>
