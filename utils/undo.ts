type RandomizerStore = ReturnType<typeof useRandomizerStore>;

function cloneXPValues(randomizer: RandomizerStore) {
    return Object.fromEntries(Object.entries(randomizer.predictedSkillXP));
}

// used to generate notifications when redoing
interface RedoEffect {
    type: string;
    goalID: string;
}

abstract class HistoryEntry {
    abstract undo(randomizer: RandomizerStore): void;
    abstract redo(randomizer: RandomizerStore): RedoEffect;
}

// generating a goal goes from null -> something
// so just go back to null
class GenerateUndoEntry extends HistoryEntry {
    previousGoalID: string | null;
    newGoalID: string;

    constructor(randomizer: RandomizerStore, previousGoalID: string | null) {
        super();

        this.previousGoalID = previousGoalID;

        if (!randomizer.currentGoalID) {
            throw new Error("Current goal is null post-generate");
        }

        this.newGoalID = randomizer.currentGoalID;
    }

    undo(randomizer: RandomizerStore) {
        // the current UI doesn't allow for this,
        // but rerolling a goal should work here
        randomizer.currentGoalID = this.previousGoalID;
    }

    redo(randomizer: RandomizerStore) {
        // generate with a pre-set goal is essentially this
        randomizer.currentGoalID = this.newGoalID;

        return {
            type: "Generated",
            goalID: this.newGoalID,
        };
    }
}

// finishing a goal may give skill XP
class FinishUndoEntry extends HistoryEntry {
    goalID: string;
    xp: Record<string, number>;

    constructor(randomizer: RandomizerStore) {
        super();

        if (!randomizer.currentGoalID) {
            throw new Error("No goal active");
        }

        this.goalID = randomizer.currentGoalID;
        this.xp = cloneXPValues(randomizer);
    }

    undo(randomizer: RandomizerStore) {
        randomizer.completion[this.goalID] -= 1;
        randomizer.currentGoalID = this.goalID;
        randomizer.predictedSkillXP = this.xp;
    }

    redo(randomizer: RandomizerStore) {
        // we're always at the correct point in time here
        const goalID = randomizer.currentGoalID!;

        randomizer.finishGoal();

        return {
            type: "Finished",
            goalID,
        };
    }
}

// cancelling a goal does not give skill XP
class CancelUndoEntry extends HistoryEntry {
    goalID: string;

    constructor(randomizer: RandomizerStore) {
        super();

        if (!randomizer.currentGoalID) {
            throw new Error("No goal active");
        }

        this.goalID = randomizer.currentGoalID;
    }

    undo(randomizer: RandomizerStore) {
        randomizer.currentGoalID = this.goalID;
    }

    redo(randomizer: RandomizerStore) {
        // cancelling is always just deleting the current goal
        const goalID = randomizer.currentGoalID!;

        randomizer.currentGoalID = null;

        return {
            type: "Canceled",
            goalID,
        };
    }
}

export class HistoryContext {
    randomizer: RandomizerStore;
    undoStack: HistoryEntry[];
    redoStack: HistoryEntry[];

    constructor(randomizer: RandomizerStore) {
        this.randomizer = randomizer;
        this.undoStack = [];
        this.redoStack = [];
    }

    prepareBeforeAction() {
        if (this.undoStack.length >= 30) {
            this.undoStack.shift();
        }
        // new action done, clear any impending undos
        this.redoStack = [];
    }

    hookGenerate(previousGoalID: string | null) {
        this.prepareBeforeAction();
        this.undoStack.push(new GenerateUndoEntry(this.randomizer, previousGoalID));
    }

    hookFinish() {
        this.prepareBeforeAction();
        this.undoStack.push(new FinishUndoEntry(this.randomizer));
    }

    hookCancel() {
        this.prepareBeforeAction();
        this.undoStack.push(new CancelUndoEntry(this.randomizer));
    }

    undo() {
        const undoEntry = this.undoStack.pop();
        if (undoEntry) {
            undoEntry.undo(this.randomizer);
            // this now becomes redoable
            this.redoStack.push(undoEntry);
        }

        console.log(this.undoStack, this.redoStack);
    }

    redo() {
        const redoEntry = this.redoStack.pop();
        if (redoEntry) {
            const effect = redoEntry.redo(this.randomizer);
            // this can now be undone again
            this.undoStack.push(redoEntry);

            console.log(this.undoStack, this.redoStack);

            // this effect object is used to create a new notification
            return effect;
        }
    }
}
