import React from 'react'
import './App.css'
// import * as monaco from "monaco-editor/esm/vs/editor/editor.api"
import * as monaco from "monaco-editor"
import { Button, Slider, Stack, TextField } from '@mui/material'

export default class App extends React.Component {
  private monacoEditorContainer: HTMLDivElement | null | undefined
  private monacoEditor: monaco.editor.IStandaloneCodeEditor | undefined

  componentDidMount() {
    if (this.monacoEditorContainer) {
      console.log('creating')
      this.monacoEditor = monaco.editor.create(this.monacoEditorContainer, {
        value: "// First line\nfunction hello() {\n\talert('Hello world!');\n}\n// Last line",
        language: 'javascript',
      })
    }
  }

  // componentDidUpdate() {
  //   if (this.monacoEditor) {
  //     console.log('layouting')
  //     this.monacoEditor.layout()
  //   }
  // }

  render(): React.ReactNode {
    return (
      <div id="main">
        <div id="visualizerContainer">
        </div>
        <div id="editorPanel">
          <TextField label="Number of Elements" variant="filled" />
          <Button variant="outlined">Create</Button>
          <div id="monacoEditorContainer" ref={ref => this.monacoEditorContainer = ref}></div>
          <div className='padding'>
            <Slider defaultValue={50} />
          </div>
          <Button variant="contained">Play</Button>
        </div>
      </div>
    )
  }
}
