export interface Reflection {
    id: string;
    date: string;
    event: {
        description: string;
        emotionalResponse: string;
    };
    beliefs: {
        self: string[];
        others: string[];
        life: string[];
    };
    contemplation: {
        level: 'superficial' | 'deep';
        insights: string;
        question: string;
    };
    transformation: {
        limitingBelief: string;
        newPerspective: string;
        doorMoment?: string;
    };
    practices: {
        breathingExercise: boolean;
        witnessPresence: boolean;
        mentalClearing: boolean;
        selfInquiry: boolean;
    };
    isEmpty: boolean;
}
