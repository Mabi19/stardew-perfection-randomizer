type RandomizerStore = ReturnType<typeof useRandomizerStore>;

function cloneXPValues(randomizer: RandomizerStore) {
    return Object.fromEntries(Object.entries(randomizer.predictedSkillXP));
}

abstract class UndoEntry {
    abstract undo(randomizer: RandomizerStore): void;
}

// generating a goal goes from null -> something
// so just go back to null
class GenerateUndoEntry extends UndoEntry {
    undo(randomizer: RandomizerStore) {
        randomizer.currentGoalID = null;
    }
}

// finishing a goal may give skill XP
class FinishUndoEntry {
    goalID: string;
    xp: Record<string, number>;

    constructor(randomizer: RandomizerStore) {
        if (!randomizer.currentGoalID) {
            throw new Error("No goal active");
        }

        this.goalID = randomizer.currentGoalID;
        this.xp = cloneXPValues(randomizer);
    }

    undo(randomizer: RandomizerStore) {
        randomizer.currentGoalID = this.goalID;
        randomizer.predictedSkillXP = this.xp;
    }
}

// cancelling a goal does not give skill XP
class CancelUndoEntry {
    goalID: string;

    constructor(randomizer: RandomizerStore) {
        if (!randomizer.currentGoalID) {
            throw new Error("No goal active");
        }

        this.goalID = randomizer.currentGoalID;
    }

    undo(randomizer: RandomizerStore) {
        randomizer.currentGoalID = this.goalID;
    }
}

export class UndoContext {
    randomizer: RandomizerStore;
    stack: UndoEntry[];

    constructor(randomizer: RandomizerStore) {
        this.randomizer = randomizer;
        this.stack = [];
    }

    limitStackSize() {
        if (this.stack.length > 30) {
            this.stack.shift();
        }
    }

    hookGenerate() {
        this.stack.push(new GenerateUndoEntry());
        this.limitStackSize();
    }

    hookFinish() {
        this.stack.push(new FinishUndoEntry(this.randomizer));
        this.limitStackSize();
    }

    hookCancel() {
        this.stack.push(new CancelUndoEntry(this.randomizer));
        this.limitStackSize();
    }

    undo() {
        this.stack.pop()?.undo(this.randomizer);
    }
}
