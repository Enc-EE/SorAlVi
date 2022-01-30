import React from 'react'
import './App.css'
import * as monaco from "monaco-editor"
import { Button, Slider, Stack, TextField } from '@mui/material'
import { AlgorithmEngine } from './algorithmEngine'

interface State {
  isPlayMode: boolean
  numberOfNumbersInput: number
}

export default class App extends React.Component<{}, State> {
  private monacoEditorContainer: HTMLDivElement | null | undefined
  private monacoEditor: monaco.editor.IStandaloneCodeEditor | undefined
  private visualizerContainer: HTMLDivElement | null | undefined

  private firstAlgorithm = "function sort(list) {\n\tvar i = 0;\n\tsoralvi.traceIndex('i', i);\n\n\twhile (i < list.length - 1) {\n\t\tvar minIndex = i;\n\t\tsoralvi.traceIndex('minIndex', minIndex);\n\n\t\tvar j = i;\n\t\tsoralvi.traceIndex('j', j);\n\n\t\twhile (j < list.length) {\n\t\t\tif (list[minIndex] > list[j]) {\n\t\t\t\tminIndex = j;\n\t\t\t\tsoralvi.traceIndex('minIndex', minIndex);\n\t\t\t}\n\t\t\tj++;\n\t\t\tsoralvi.traceIndex('j', j);\n\t\t}\n\t\tsoralvi.swapValues(i, minIndex);\n\n\t\ti++;\n\t\tsoralvi.traceIndex('i', i);\n\t}\n}\n"

  private stepsPerSecond = 20
  private stepInterval = 1000 / this.stepsPerSecond
  private lastFrameTime: DOMHighResTimeStamp | undefined
  private visualizerCanvas: HTMLCanvasElement | undefined
  private ctx: CanvasRenderingContext2D | null | undefined

  private algorithmEngine: AlgorithmEngine = new AlgorithmEngine()

  constructor(props: {}) {
    super(props)

    this.state = {
      isPlayMode: false,
      numberOfNumbersInput: 100,
    };

    (window as any)['ae'] = this.algorithmEngine
  }

  componentDidMount() {
    if (this.monacoEditorContainer) {
      console.log('creating monaco')
      this.monacoEditor = monaco.editor.create(this.monacoEditorContainer, {
        value: this.firstAlgorithm,
        language: 'javascript',
      })
      // this.monacoEditor.change
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

  public generateNumbersToSort = () => {
    this.algorithmEngine.createNew(this.state.numberOfNumbersInput)
    this.drawNumbers()
  }

  public runAlgorithm = () => {
    if (this.monacoEditor) {
      this.algorithmEngine.runAlgorithm(this.monacoEditor.getValue())
    }
  }

  playPause = () => {
    if (this.state.isPlayMode) {
      if (this.monacoEditor) {
        this.monacoEditor.updateOptions({
          readOnly: false
        })
      }
      this.setState({
        ...this.state,
        isPlayMode: false,
      })
    }
    else {
      if (this.monacoEditor) {
        this.monacoEditor.updateOptions({
          readOnly: true
        })
      }
      this.setState({
        ...this.state,
        isPlayMode: true,
      }, () => {
        this.animationLoop(undefined)
      })
    }
  }

  animationLoop = (time: DOMHighResTimeStamp | undefined) => {
    if (this.lastFrameTime && time) {
      if (time - this.lastFrameTime > this.stepInterval) {
        this.lastFrameTime = time
        this.drawNumbers()
        if (!this.algorithmEngine.step()) {
          if (this.monacoEditor) {
            this.monacoEditor.updateOptions({
              readOnly: false
            })
          }
          this.setState({
            ...this.state,
            isPlayMode: false,
          })
        }
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

      const barWidth = this.visualizerCanvas.width / this.algorithmEngine.numberOfNumbers
      const barMaxHeight = this.visualizerCanvas.height
      const maxValue = Math.max(...this.algorithmEngine.numbersToSort)

      const highlights = this.algorithmEngine.currentHighlights.map(x => x.i)

      for (let i = 0; i < this.algorithmEngine.numberOfNumbers; i++) {
        const numberToSort = this.algorithmEngine.numbersToSort[i];
        this.ctx.fillStyle = highlights.indexOf(i) >= 0 ? 'red' : 'black'
        this.ctx.fillRect(i * barWidth, barMaxHeight, barWidth, -barMaxHeight * (numberToSort / maxValue))
      }
    }
  }

  render(): React.ReactNode {
    return (
      <div id="main">
        <div id="visualizerContainer" ref={ref => this.visualizerContainer = ref}></div>
        <div id="editorPanel">
          <div id="monacoEditorContainer" ref={ref => this.monacoEditorContainer = ref}></div>
          {/* <div className='padding'>
            <Slider defaultValue={50} />
          </div> */}
          <div className='panel-actions'>
            <div className='number-input'>
              <TextField disabled={this.state.isPlayMode} type="number" value={this.state.numberOfNumbersInput} onChange={e => this.setState({ ...this.state, numberOfNumbersInput: +e.target.value })} label="Number of Elements" variant="filled" />
              <Button disabled={this.state.isPlayMode} onClick={_ => this.generateNumbersToSort()} variant="outlined">Create</Button>
            </div>
            <Button onClick={_ => this.runAlgorithm()} disabled={this.state.isPlayMode} variant="outlined">Execute Algorithm</Button>
            <Button onClick={_ => this.playPause()} variant="contained">{this.state.isPlayMode ? 'Pause' : 'Play'}</Button>
          </div>
        </div>
      </div>
    )
  }
}
