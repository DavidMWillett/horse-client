import React from "react";
import Select from "react-select";
import * as Rota from "./rota";

type UploadFormProps = {
  onUploadFile: (file: File | undefined) => void,
  disabled: boolean,
}

class UploadForm extends React.Component<UploadFormProps> {
  private readonly fileInput: React.RefObject<HTMLInputElement>;
  private readonly rotaDoc: Rota.Document;

  constructor(props: UploadFormProps) {
    super(props);
    this.fileInput = React.createRef();
    this.rotaDoc = new Rota.Document();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileInputChange = this.handleFileInputChange.bind(this);
  }

  handleFileInputChange(event: React.FormEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) {
      this.rotaDoc.load(file).then(sheetNames => console.log(sheetNames));
    }
  }

  handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    this.props.onUploadFile(this.fileInput.current?.files?.[0]);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <fieldset disabled={this.props.disabled}>
          <label>
            File containing rota:
            <input type="file" ref={this.fileInput} onChange={this.handleFileInputChange}/>
          </label>
          <label>
            Sheet to be planned:
            <Select />
          </label>
          <button type="submit">
            Upload file
          </button>
        </fieldset>
      </form>
    );
  }
}

export default UploadForm;