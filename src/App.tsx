import React from 'react'
import './App.css'
import * as monaco from "monaco-editor"
import { Button, Slider, Stack, TextField } from '@mui/material'

interface State {
  isPlayMode: boolean
  numberOfNumbers: number
}

export default class App extends React.Component<{}, State> {
  private monacoEditorContainer: HTMLDivElement | null | undefined
  private monacoEditor: monaco.editor.IStandaloneCodeEditor | undefined
  private numbersToSort: number[] = []
  private visualizerContainer: HTMLDivElement | null | undefined

  private stepsPerSecond = 1
  private stepInterval = 1000 / this.stepsPerSecond
  private lastFrameTime: DOMHighResTimeStamp | undefined
  private visualizerCanvas: HTMLCanvasElement | undefined
  private ctx: CanvasRenderingContext2D | null | undefined

  constructor(props: {}) {
    super(props)

    this.state = {
      isPlayMode: false,
      numberOfNumbers: 100,
    }
  }

  componentDidMount() {
    if (this.monacoEditorContainer) {
      console.log('creating monaco')
      this.monacoEditor = monaco.editor.create(this.monacoEditorContainer, {
        value: "// First line\nfunction hello() {\n\talert('Hello world!');\n}\n// Last line",
        language: 'javascript',
      })
    }
    if (this.visualizerContainer) {
      console.log('creating canvas')
      this.visualizerCanvas = document.createElement('canvas')
      this.visualizerContainer.appendChild(this.visualizerCanvas)
      this.visualizerCanvas.width = this.visualizerContainer.clientWidth
      this.visualizerCanvas.height = this.visualizerContainer.clientHeight
      this.ctx = this.visualizerCanvas.getContext('2d');
    }
  }

  generateNumbersToSort = () => {
    console.log('generating numbers')

    const allNumbers: number[] = []
    for (let i = 1; i <= this.state.numberOfNumbers; i++) {
      allNumbers.push(i)
    }

    this.numbersToSort = []

    while (allNumbers.length > 0) {
      const index = Math.floor(Math.random() * allNumbers.length)
      this.numbersToSort.push(allNumbers.splice(index, 1)[0])
    }

    console.log('generated', this.state.numberOfNumbers, 'numbers')
  }

  playPause = () => {
    if (this.state.isPlayMode) {
      this.setState({
        ...this.state,
        isPlayMode: false,
      })
    }
    else {
      this.setState({
        ...this.state,
        isPlayMode: true,
      })
      this.animationLoop(undefined)
    }
  }

  animationLoop = (time: DOMHighResTimeStamp | undefined) => {

    if (this.lastFrameTime && time) {
      if (time - this.lastFrameTime > this.stepInterval) {
        this.lastFrameTime = time
        this.drawNumbers()
      }
    } else {
      this.lastFrameTime = time
      this.drawNumbers()
    }

    if (this.state.isPlayMode) {
      window.requestAnimationFrame(this.animationLoop)
    }
  }

  drawNumbers = () => {
    if (this.visualizerCanvas && this.ctx) {
      this.ctx.clearRect(0, 0, this.visualizerCanvas.width, this.visualizerCanvas.height)

      const barWidth = this.visualizerCanvas.width / this.numbersToSort.length
      const barMaxHeight = this.visualizerCanvas.height
      const maxValue = Math.max(...this.numbersToSort)

      for (let i = 0; i < this.numbersToSort.length; i++) {
        const numberToSort = this.numbersToSort[i];
        this.ctx.fillRect(i * barWidth, barMaxHeight, barWidth, -barMaxHeight * ( numberToSort / maxValue ))
      }
    }
  }

  render(): React.ReactNode {
    return (
      <div id="main">
        <div id="visualizerContainer" ref={ref => this.visualizerContainer = ref}></div>
        <div id="editorPanel">
          <TextField type="number" value={this.state.numberOfNumbers} onChange={e => this.setState({ ...this.state, numberOfNumbers: +e.target.value })} label="Number of Elements" variant="filled" />
          <Button onClick={_ => this.generateNumbersToSort()} variant="outlined">Create</Button>
          <div id="monacoEditorContainer" ref={ref => this.monacoEditorContainer = ref}></div>
          {/* <div className='padding'>
            <Slider defaultValue={50} />
          </div> */}
          <Button onClick={_ => this.playPause()} variant="contained">{this.state.isPlayMode ? 'Pause' : 'Play'}</Button>
        </div>
      </div>
    )
  }
}
