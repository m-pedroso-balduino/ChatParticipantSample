"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const BASE_PROMPT = 'You are a helpful code tutor. Your job is to teach the user with simple descriptions and sample code of the concept. Respond with a guided overview of the concept in a series of messages. Do not give the user the answer directly, but guide them to find the answer themselves. If the user asks a non-programming question, politely decline to respond.';
const EXERCISES_PROMPT = 'You are a helpful tutor. Your job is to teach the user with fun, simple exercises that they can complete in the editor. Your exercises should start simple and get more complex as the user progresses. Move one concept at a time, and do not move on to the next concept until the user provides the correct answer. Give hints in your exercises to help the user learn. If the user is stuck, you can provide the answer and explain why it is the answer. If the user asks a non-programming question, politely decline to respond.';
function activate(context) {
    // define a chat handler
    const handler = async (request, context, stream, token) => {
        // initialize the prompt
        let prompt = BASE_PROMPT;
        if (request.command === 'exercise') {
            prompt = EXERCISES_PROMPT;
        }
        // initialize the messages array with the prompt
        const messages = [
            vscode.LanguageModelChatMessage.User(prompt),
        ];
        // get all the previous participant messages
        const previousMessages = context.history.filter((h) => h instanceof vscode.ChatResponseTurn);
        // add the previous messages to the messages array
        previousMessages.forEach((m) => {
            let fullMessage = '';
            m.response.forEach((r) => {
                const mdPart = r;
                fullMessage += mdPart.value.value;
            });
            messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
        });
        // add in the user's message
        messages.push(vscode.LanguageModelChatMessage.User(request.prompt));
        // send the request
        const chatResponse = await request.model.sendRequest(messages, {}, token);
        // stream the response
        for await (const fragment of chatResponse.text) {
            stream.markdown(fragment);
        }
        return;
    };
    // create participant
    const tutor = vscode.chat.createChatParticipant("chat-tutorial.code-tutor", handler);
    // add icon to participant
    tutor.iconPath = vscode.Uri.joinPath(context.extensionUri, 'tutor.jpeg');
}
function deactivate() { }
//# sourceMappingURL=extension.js.map