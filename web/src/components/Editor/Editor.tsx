import { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import "../../less/editor.less";

export interface EditorRefActions {
  focus: FunctionType;
  insertText: (text: string, prefix?: string, suffix?: string) => void;
  removeText: (start: number, length: number) => void;
  setContent: (text: string) => void;
  getContent: () => string;
  getSelectedContent: () => string;
  getCaretPosition: () => number;
  setCaretPosition: (startPos: number, endPos?: number) => void;
}

interface Props {
  className: string;
  initialContent: string;
  placeholder: string;
  fullscreen: boolean;
  tools?: ReactNode;
  onContentChange: (content: string, cursor: number) => void;
  onCaretChange: (cursor: number) => void;
  onPaste: (event: React.ClipboardEvent) => void;
}

const Editor = forwardRef(function Editor(props: Props, ref: React.ForwardedRef<EditorRefActions>) {
  const {
    className,
    initialContent,
    placeholder,
    fullscreen,
    onPaste,
    onContentChange: handleContentChangeCallback,
    onCaretChange: handleCaretChangeCallback,
  } = props;
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.value = initialContent;
      handleContentChangeCallback(initialContent, editorRef.current.selectionStart);
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && !fullscreen) {
      updateEditorHeight();
    }
  }, [editorRef.current?.value, fullscreen]);

  useEffect(() => {
    document.addEventListener("selectionchange", function () {
      handleCaretChangeCallback(editorRef.current?.selectionStart ?? -1);
    });
  }, []);

  const updateEditorHeight = () => {
    if (editorRef.current) {
      editorRef.current.style.height = "auto";
      editorRef.current.style.height = (editorRef.current.scrollHeight ?? 0) + "px";
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        editorRef.current?.focus();
      },
      insertText: (content = "", prefix = "", suffix = "") => {
        if (!editorRef.current) {
          return;
        }

        const caretPosition = editorRef.current.selectionStart;
        const endPosition = editorRef.current.selectionEnd;
        const prevValue = editorRef.current.value;
        const value =
          prevValue.slice(0, caretPosition) +
          prefix +
          (content || prevValue.slice(caretPosition, endPosition)) +
          suffix +
          prevValue.slice(endPosition);

        editorRef.current.value = value;
        editorRef.current.focus();
        editorRef.current.selectionEnd = endPosition + prefix.length + content.length;
        handleContentChangeCallback(editorRef.current.value, editorRef.current.selectionStart);
        updateEditorHeight();
      },
      removeText: (start: number, length: number) => {
        if (!editorRef.current) {
          return;
        }

        const prevValue = editorRef.current.value;
        const value = prevValue.slice(0, start) + prevValue.slice(start + length);
        editorRef.current.value = value;
        editorRef.current.focus();
        editorRef.current.selectionEnd = start;
        handleContentChangeCallback(editorRef.current.value, editorRef.current.selectionStart);
        updateEditorHeight();
      },
      setContent: (text: string) => {
        if (editorRef.current) {
          editorRef.current.value = text;
          editorRef.current.focus();
          handleContentChangeCallback(editorRef.current.value, editorRef.current.selectionStart);
          updateEditorHeight();
        }
      },
      getContent: (): string => {
        return editorRef.current?.value ?? "";
      },
      getCaretPosition: (): number => {
        return editorRef.current?.selectionStart ?? 0;
      },
      getSelectedContent: () => {
        const start = editorRef.current?.selectionStart;
        const end = editorRef.current?.selectionEnd;
        return editorRef.current?.value.slice(start, end) ?? "";
      },
      setCaretPosition: (startPos: number, endPos?: number) => {
        const _endPos = isNaN(endPos as number) ? startPos : (endPos as number);
        editorRef.current?.setSelectionRange(startPos, _endPos);
      },
    }),
    []
  );

  const handleEditorInput = useCallback(() => {
    handleContentChangeCallback(editorRef.current?.value ?? "", editorRef.current?.selectionStart ?? -1);
    updateEditorHeight();
  }, []);

  return (
    <div className={"common-editor-wrapper " + className}>
      <textarea
        className="common-editor-inputer"
        rows={1}
        placeholder={placeholder}
        ref={editorRef}
        onPaste={onPaste}
        onInput={handleEditorInput}
      ></textarea>
    </div>
  );
});

export default Editor;
