import React from "react";
import {Duty, Roster, Shift} from "./model/domain";

function RosterPreview(props: { roster: Roster }) {
  const nameToDutiesMap: Map<string, Array<Duty>> = new Map();
  let unassignedTaskCount = 0;
  props.roster.employees.forEach(employee =>
    nameToDutiesMap.set(employee.name, new Array(Shift.enumValues.length).fill(undefined))
  );
  props.roster.tasks.forEach(task => {
    const employee = task.employee;
    if (employee !== null) {
      const duties = nameToDutiesMap.get(employee.name);
      duties![task.shift.enumOrdinal] = task.duty;
    } else {
      unassignedTaskCount++;
    }
  });

  return (
    <React.Fragment>
      <table className="table table-bordered table-sm">
        <thead>
          <tr>
            <th colSpan={11}>Rota Preview</th>
          </tr>
          <tr>
            <th>Name</th>
            <th colSpan={2}>Monday</th>
            <th colSpan={2}>Tuesday</th>
            <th colSpan={2}>Wednesday</th>
            <th colSpan={2}>Thursday</th>
            <th colSpan={2}>Friday</th>
          </tr>
          <tr>
            <th style={{width: "10%"}}/>
            <th style={{width: "9%"}}>AM</th>
            <th style={{width: "9%"}}>PM</th>
            <th style={{width: "9%"}}>AM</th>
            <th style={{width: "9%"}}>PM</th>
            <th style={{width: "9%"}}>AM</th>
            <th style={{width: "9%"}}>PM</th>
            <th style={{width: "9%"}}>AM</th>
            <th style={{width: "9%"}}>PM</th>
            <th style={{width: "9%"}}>AM</th>
            <th style={{width: "9%"}}>PM</th>
          </tr>
        </thead>
        <tbody>
          {
            Array.from(nameToDutiesMap)
              .filter(([, duties]) => duties.some(duty => duty !== undefined))
              .map(([name, duties]) =>
                <tr>
                  <td>{name}</td>
                  {
                    duties.map(duty => {
                        if (duty) {
                          const style = {backgroundColor: duty.color.hex()};
                          return <td style={style}/>
                        } else {
                          return <td/>
                        }
                      }
                    )
                  }
                </tr>
              )
          }
        </tbody>
      </table>
      <h2>
        Unassigned tasks: {unassignedTaskCount}
      </h2>
    </React.Fragment>
  );
}

export default RosterPreview;