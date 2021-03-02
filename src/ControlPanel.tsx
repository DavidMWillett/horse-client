import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import FileSaver from "file-saver";
import SelectionForm from "./SelectionForm";
import * as Rota from "./rota";

enum Phase {
  INITIAL,
  SOLVING,
  FINISHED,
}

type ControlPanelProps = {
  hasFinished: boolean,
  onFinished: () => void,
};

type ControlPanelState = {
  hasStartedSolving: boolean,
};

class ControlPanel extends React.Component<ControlPanelProps, ControlPanelState> {
  private _solvedFile: File | null = null;

  private get solvedFile() {
    return this._solvedFile!;
  }

  private set solvedFile(file: File) {
    this._solvedFile = file;
    this.props.onFinished();
  }

  constructor(props: ControlPanelProps) {
    super(props);
    this.state = {
      hasStartedSolving: false,
    };
    this.handlePlanRotaSheet = this.handlePlanRotaSheet.bind(this);
  }

  handlePlanRotaSheet(rotaDocument: Rota.Document) {
    this.setState({hasStartedSolving: true});
    rotaDocument.solve().then(file => {
      this.solvedFile = file;
    });
  }

  render() {
    let phase: Phase;
    if (!this.state.hasStartedSolving) {
      phase = Phase.INITIAL;
    } else if (!this.props.hasFinished) {
      phase = Phase.SOLVING;
    } else {
      phase = Phase.FINISHED;
    }

    return (
      <Container fluid className="p-0">
        <Row noGutters>
          <Col>
            {(!this.props.hasFinished)
              ? <SelectionForm
                onPlanRotaSheet={this.handlePlanRotaSheet}
                disabled={this.state.hasStartedSolving}/>
              : <SolvedNotice
                onSaveRotaFile={() => FileSaver.saveAs(this.solvedFile)}/>}
          </Col>
          <Col xs="auto" className="pl-3 align-self-end">
            <HorseAnimation phase={phase}/>
          </Col>
        </Row>
      </Container>
    );
  }
}

function SolvedNotice(props: { onSaveRotaFile: () => void }) {
  return (
    <div>
      <p>All done! HORSE has successfully completed the rota sheet for the specified week. If you are happy with
        the assignments listed in the table, click the "Save rota file" button to save the file containing the
        completed rota, then follow the instructions below.</p>
      <Button onClick={props.onSaveRotaFile}>Save rota file</Button>
    </div>
  );
}

function HorseAnimation(props: { phase: Phase }) {
  switch (props.phase) {
    case Phase.INITIAL:
      return <img src="horse-start.gif" alt="Horse ready and waiting"/>
    case Phase.SOLVING:
      return <img src="horse-animation.gif" alt="Horse working hard"/>
    case Phase.FINISHED:
      return <img src="horse-end.gif" alt="Horse all finished"/>
  }
}

export default ControlPanel;
