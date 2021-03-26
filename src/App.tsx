import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import FileSaver from "file-saver";
import ControlPanel from "./components/ControlPanel";
import InstructionPanel from "./components/InstructionPanel";
import "./App.css";
import RosterPreview from "./components/RosterPreview";
import {Roster} from "./components/model/domain";
import Solver from "./components/model/solver";
import {Col, Container, Row} from "react-bootstrap";

type AppState = {
  roster: Roster | null;
};

class App extends React.Component<{}, AppState> {
  solver: Solver;

  constructor(props: {}) {
    super(props);
    this.state = {
      roster: null,
    }
    this.solver = new Solver();
    this.handleSaveFile = this.handleSaveFile.bind(this);
  }

  render() {
    return (
      <React.Fragment>
        <header>
          <h1>
            <span>Haemato-</span><span>Oncology</span> <span>Rota</span> <span>Shift</span> <span>Evaluator</span>
          </h1>
          <p>Version {process.env.REACT_APP_VERSION}</p>
        </header>
        <main>
          <Container fluid id="content">
            <Row className="p-3">
              <Col xs={3}>
                <aside>
                  <InstructionPanel hasFinished={this.state.roster !== null}/>
                </aside>
              </Col>
              <Col xs={3}>
                <section>
                  <ControlPanel
                    solver={this.solver}
                    hasFinished={this.state.roster !== null}
                    onFinished={roster => this.setState({roster: roster})}
                    onSaveFile={this.handleSaveFile}
                  />
                </section>
              </Col>
              <Col xs={6}>
                <section>
                  <RosterPreview roster={this.state.roster}/>
                </section>
              </Col>
            </Row>
          </Container>
        </main>
        <footer></footer>
      </React.Fragment>
    );
  }

  private handleSaveFile() {
    this.solver.getFile(this.state.roster!).then(file => {
      FileSaver.saveAs(file);
    });
  }
}

export default App;
