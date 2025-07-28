import os, pickle
import numpy as np
from tensorflow.keras.models import load_model, Model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.layers import Input, Attention, Concatenate
from config import MAX_INPUT_LEN, MAX_TARGET_LEN, LATENT_DIM

# Load
model_dir = os.path.join("models", "synerprise-phonetic")
model = load_model(os.path.join(model_dir, "bangla_python_seq2seq_attention_model.keras"))
with open(os.path.join(model_dir, "input_tokenizer.pkl"), "rb") as f:
    input_tokenizer = pickle.load(f)
with open(os.path.join(model_dir, "target_tokenizer.pkl"), "rb") as f:
    target_tokenizer = pickle.load(f)

# Build Inference Model
encoder_inputs = model.input[0]
encoder_outputs, state_h, state_c = model.get_layer("lstm_2").output
encoder_model = Model(encoder_inputs, [encoder_outputs, state_h, state_c])

decoder_inputs = Input(shape=(1,))
decoder_state_input_h = Input(shape=(LATENT_DIM,))
decoder_state_input_c = Input(shape=(LATENT_DIM,))
encoder_outputs_placeholder = Input(shape=(MAX_INPUT_LEN, LATENT_DIM))

decoder_embedding = model.get_layer("embedding_3")(decoder_inputs)
decoder_lstm = model.get_layer("lstm_3")
decoder_dense = model.get_layer("dense_1")

decoder_outputs, h, c = decoder_lstm(decoder_embedding, initial_state=[decoder_state_input_h, decoder_state_input_c])
attention = Attention()([decoder_outputs, encoder_outputs_placeholder])
concat = Concatenate()([decoder_outputs, attention])
final_outputs = decoder_dense(concat)

decoder_model = Model(
    [decoder_inputs, encoder_outputs_placeholder, decoder_state_input_h, decoder_state_input_c],
    [final_outputs, h, c]
)

reverse_word_index = target_tokenizer.index_word

def decode_sequence(input_seq):
    enc_outs, h, c = encoder_model.predict(input_seq, verbose=0)
    states = [h, c]
    target_seq = np.zeros((1, 1))
    decoded = ''

    while True:
        output_tokens, h, c = decoder_model.predict([target_seq, enc_outs] + states, verbose=0)
        sampled_index = np.argmax(output_tokens[0, -1, :])
        sampled_word = reverse_word_index.get(sampled_index, '')

        if sampled_index == 0 or len(decoded.split()) > MAX_TARGET_LEN:
            break
        decoded += (' ' if decoded else '') + sampled_word

        target_seq[0, 0] = sampled_index
        states = [h, c]

    return decoded.strip()

def generate_code(text):
    try:
        seq = input_tokenizer.texts_to_sequences([text])
        pad = pad_sequences(seq, maxlen=MAX_INPUT_LEN, padding='post')
        return decode_sequence(pad)
    except Exception as e:
        return f"[ERROR] Phonetic model failed: {e}"
