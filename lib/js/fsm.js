



class RNav_FiniteStateMachine extends RNav_Generic {

    constructor() {
        super();
    }

    parseUML(fsmDef) {
        
        const regex = /^([\w\s]+) --> ([\w\s]+) : ([\w\s]+)(?: \[([\w\s<>=!]+)\])?(?: \/ ([\w\s()]+))?$/;
        
        const transitions = [];

        const lines = fsmDef.split("\n").map(line => line.trim()).filter(line => line);

        lines.forEach(line => {
            const match = line.match(regex);

            if (match) {
                const [, currentState, newState, signal, details, callback] = match;
                
                transitions.push({
                    currentState: currentState.trim(),
                    newState: newState.trim(),
                    signal: signal.trim(),
                    details: details ? details.trim() : undefined,
                    callback: callback ? callback.trim() : undefined
                });
            }
        });

        return {transitions};
    }

}