import { createRef, useCallback, useEffect, useState } from "react";
import * as monaco from "monaco-editor";
import { Button, Link, TextField } from "@mui/material";
import { algen } from "./algorithmEngine";
import "./App.css";

let monacoEditor: monaco.editor.IStandaloneCodeEditor | undefined;
let lastFrameTime: DOMHighResTimeStamp | undefined;

// eslint-disable-next-line @typescript-eslint/ban-types
export const App = () => {
  const [isPlayMode, setIsPlayMode] = useState(false);
  const [numberOfNumbersInput, setNumberOfNumbersInput] = useState(100);

  const monacoEditorContainer = createRef<HTMLDivElement>();
  const visualizerContainer = createRef<HTMLDivElement>();

  const firstAlgorithm =
    "function sort(list) {\n\tvar i = 0;\n\tsoralvi.traceIndex('i', i);\n\n\twhile (i < list.length - 1) {\n\t\tvar minIndex = i;\n\t\tsoralvi.traceIndex('minIndex', minIndex);\n\n\t\tvar j = i;\n\t\tsoralvi.traceIndex('j', j);\n\n\t\twhile (j < list.length) {\n\t\t\tif (list[minIndex] > list[j]) {\n\t\t\t\tminIndex = j;\n\t\t\t\tsoralvi.traceIndex('minIndex', minIndex);\n\t\t\t}\n\t\t\tj++;\n\t\t\tsoralvi.traceIndex('j', j);\n\t\t}\n\t\tsoralvi.swapValues(i, minIndex);\n\n\t\ti++;\n\t\tsoralvi.traceIndex('i', i);\n\t}\n}\n";

  const stepsPerSecond = 20;
  const stepInterval = 1000 / stepsPerSecond;
  const [visualizerCanvas] = useState(document.createElement("canvas"));

  useEffect(() => {
    if (
      monacoEditorContainer.current &&
      visualizerContainer.current &&
      !monacoEditor
    ) {
      console.log("creating monaco");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      monacoEditor = monaco.editor.create(monacoEditorContainer.current, {
        value: firstAlgorithm,
        language: "javascript",
      });

      console.log("creating canvas");
      visualizerContainer.current.appendChild(visualizerCanvas);
      visualizerCanvas.width = visualizerContainer.current.clientWidth;
      visualizerCanvas.height = visualizerContainer.current.clientHeight;
    }
  }, []);

  const generateNumbersToSort = () => {
    algen.createNew(numberOfNumbersInput);
    drawNumbers();
  };

  const runAlgorithm = () => {
    if (monacoEditor) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      algen.runAlgorithm(monacoEditor.getValue());
    }
  };

  const playPause = () => {
    if (isPlayMode) {
      if (monacoEditor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        monacoEditor.updateOptions({
          readOnly: false,
        });
      }
      setIsPlayMode(false);
    } else {
      if (monacoEditor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        monacoEditor.updateOptions({
          readOnly: true,
        });
      }
      setIsPlayMode(true);
    }
  };

  const drawNumbers = useCallback(() => {
    const ctx = visualizerCanvas.getContext("2d");
    if (visualizerCanvas && ctx) {
      ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

      const barWidth = visualizerCanvas.width / algen.numberOfNumbers;
      const barMaxHeight = visualizerCanvas.height;
      const maxValue = Math.max(...algen.numbersToSort);

      const highlights = algen.currentHighlights.map((x) => x.i);

      for (let i = 0; i < algen.numberOfNumbers; i++) {
        const numberToSort = algen.numbersToSort[i];
        ctx.fillStyle = highlights.indexOf(i) >= 0 ? "red" : "black";
        ctx.fillRect(
          i * barWidth,
          barMaxHeight,
          barWidth,
          -barMaxHeight * (numberToSort / maxValue)
        );
      }
    }
  }, [visualizerCanvas]);

  const animationLoop = useCallback(
    (time: DOMHighResTimeStamp | undefined) => {
      if (lastFrameTime && time) {
        if (time - lastFrameTime > stepInterval) {
          lastFrameTime = time;
          drawNumbers();
          if (!algen.step()) {
            if (monacoEditor) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              monacoEditor.updateOptions({
                readOnly: false,
              });
            }
            setIsPlayMode(false);
          }
        }
      } else {
        lastFrameTime = time;
        drawNumbers();
      }

      if (isPlayMode) {
        window.requestAnimationFrame(animationLoop);
      }
    },
    [drawNumbers, isPlayMode, stepInterval]
  );

  useEffect(() => {
    if (isPlayMode) {
      animationLoop(undefined);
    }
  }, [animationLoop, isPlayMode]);

  return (
    <div id="main">
      <div id="visualizerContainer" ref={visualizerContainer}></div>
      <div id="editorPanel">
        <div id="monacoEditorContainer" ref={monacoEditorContainer}></div>
        {/* <div className='padding'>
            <Slider defaultValue={50} />
          </div> */}
        <div className="panel-actions">
          <div className="number-input">
            <TextField
              disabled={isPlayMode}
              type="number"
              value={numberOfNumbersInput}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              onChange={(e) => setNumberOfNumbersInput(+e.target.value)}
              label="Number of Elements"
              variant="filled"
            />
            <Button
              disabled={isPlayMode}
              onClick={() => generateNumbersToSort()}
              variant="outlined"
            >
              Create
            </Button>
          </div>
          <Button
            onClick={() => runAlgorithm()}
            disabled={isPlayMode}
            variant="outlined"
          >
            Execute Algorithm
          </Button>
          <Button onClick={() => playPause()} variant="contained">
            {isPlayMode ? "Pause" : "Play"}
          </Button>
          <Link href="https://github.com/Enc-EE/SorAlVi" target="_blank">
            See Project on GitHub
          </Link>
        </div>
      </div>
    </div>
  );
};
