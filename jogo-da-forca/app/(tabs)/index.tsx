import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const WORDS = [
  'FORD', 'CAMARO', 'LAMBORGHINI', 'FIAT', 'MERCEDES', 'ESCAPAMENTO', 'JDM', 'MASSERATTI', 'VOLVO', 'SUPRA',
  'PATHEON', 'VOLKSWAGEN', 'ZONDA', 'PAGANI', 'NISSAN', 'TOYOTA', 'HILUX', 'PALIO', 'OPALA', 'BMW',
  'LADA', 'GOLF', 'VIRTUS', 'FIESTA', 'HONDA', 'DAIHATSU', 'ISUZU', 'GOL', 'POLO', 'PUMA',
  'JETTA', 'GURGEL'
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_WRONG = 6;

export default function App() {
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [finished, setFinished] = useState<null | 'win' | 'lose'>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  const masked = useMemo(() => {
    if (!word) return '';
    return word
      .split('')
      .map(l => (guessed.includes(l) ? l : '_'))
      .join(' ');
  }, [word, guessed]);

  function pickWord() {
    const idx = Math.floor(Math.random() * WORDS.length);
    return WORDS[idx].toUpperCase();
  }

  function startNewGame() {
    const w = pickWord();
    setWord(w);
    setGuessed([]);
    setWrong([]);
    setInput('');
    setFinished(null);
  }

  function handleGuessLetter(letter: string) {
    if (finished) return;
    letter = letter.toUpperCase();
    if (!/^[A-Z]$/.test(letter)) return;
    if (guessed.includes(letter)) return;

    setGuessed(prev => [...prev, letter]);

    if (word.includes(letter)) {
      const nextGuessed = [...guessed, letter];
      const allFound = word.split('').every(l => nextGuessed.includes(l));
      if (allFound) {
        setFinished('win');
      }
    } else {
      const nextWrong = [...wrong, letter];
      setWrong(nextWrong);
      if (nextWrong.length >= MAX_WRONG) {
        setFinished('lose');
      }
    }
  }

  function handleSubmitInput() {
    if (!input) return;
    handleGuessLetter(input[0]);
    setInput('');
  }

  function renderKeyboard() {
    return (
      <View style={styles.keyboard}>
        {ALPHABET.map(letter => {
          const used = guessed.includes(letter);
          const wrongUsed = wrong.includes(letter);
          return (
            <TouchableOpacity
              key={letter}
              style={[
                styles.key,
                used && styles.keyUsed,
                wrongUsed && styles.keyWrong,
              ]}
              disabled={used}
              onPress={() => handleGuessLetter(letter)}
            >
              <Text style={styles.keyText}>{letter}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  function renderHangman() {
    const parts = wrong.length;
    return (
      <View style={styles.hangmanBox}>
        {/* Forca */}
        <View style={[styles.line, { width: 100, height: 6, top: 0, left: 0 }]} />
        <View style={[styles.line, { width: 6, height: 180, top: 0, left: 0 }]} />
        <View style={[styles.line, { width: 60, height: 6, top: 0, left: 0 }]} />
        <View style={[styles.line, { width: 4, height: 20, top: 0, left: 60 }]} />

        {/* Boneco */}
        {parts > 0 && <View style={styles.head} />}
        {parts > 1 && <View style={[styles.body]} />}
        {parts > 2 && <View style={[styles.arm, { transform: [{ rotate: '-30deg' }] }]} />}
        {parts > 3 && <View style={[styles.arm, { transform: [{ rotate: '30deg' }] }]} />}
        {parts > 4 && <View style={[styles.leg, { transform: [{ rotate: '-30deg' }] }]} />}
        {parts > 5 && <View style={[styles.leg, { transform: [{ rotate: '30deg' }] }]} />}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Jogo da Forca Automotivo</Text>

        <View style={styles.topRow}>
          {renderHangman()}

          <View style={styles.panel}>
            <Text style={styles.label}>Palavra</Text>
            <Text style={styles.word}>{masked}</Text>

            <Text style={[styles.small, { marginTop: 10 }]}>Tentativas restantes: {MAX_WRONG - wrong.length}</Text>

            <View style={styles.inputRow}>
              <TextInput
                placeholder="Digite uma letra"
                value={input}
                onChangeText={t => setInput(t.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                style={styles.input}
                maxLength={1}
                editable={!finished}
                onSubmitEditing={handleSubmitInput}
              />
              <TouchableOpacity style={styles.btn} onPress={handleSubmitInput} disabled={!!finished}>
                <Text style={styles.btnText}>Ok</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.btn, { marginTop: 10 }]} onPress={startNewGame}>
              <Text style={styles.btnText}>Reiniciar Jogo</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Letras usadas:</Text>
              <View style={styles.triedRow}>
                <Text style={styles.small}>Letras certas: {guessed.filter(l => word.includes(l)).join(' ') || '-'}</Text>
                <Text style={styles.small}>Letras erradas: {wrong.join(' ') || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.label}>Letras</Text>
          {renderKeyboard()}
        </View>

        {finished && (
          <View style={styles.resultBox}>
            {finished === 'win' ? (
              <>
                <Text style={styles.winTitle}>Você ganhoooou!</Text>
                <Text style={styles.resultWord}>A palavra é: {word}</Text>
              </>
            ) : (
              <>
                <Text style={styles.loseTitle}>Você não conseguiu, tente novamente.</Text>
                <Text style={styles.resultWord}>A palavra era: {word}</Text>
              </>
            )}
            <TouchableOpacity style={[styles.btn, { marginTop: 12 }]} onPress={startNewGame} disabled={!!finished && finished !== null}>
              <Text style={styles.btnText}>Jogar novamente!</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a' // fundo principal
  },
  content: {
    padding: 18,
    alignItems: 'stretch'
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  hangmanBox: {
    width: 120,
    height: 200,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    position: 'relative',
    marginRight: 10
  },
  line: {
    position: 'absolute',
    backgroundColor: '#06b6d4' // detalhes do poste neon
  },
  head: {
    position: 'absolute',
    top: 30,
    left: 50,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#06b6d4'
  },
  body: {
    position: 'absolute',
    top: 60,
    left: 63,
    width: 4,
    height: 50,
    backgroundColor: '#06b6d4'
  },
  arm: {
    position: 'absolute',
    top: 70,
    left: 63,
    width: 40,
    height: 4,
    backgroundColor: '#06b6d4'
  },
  leg: {
    position: 'absolute',
    top: 110,
    left: 63,
    width: 40,
    height: 4,
    backgroundColor: '#06b6d4'
  },
  panel: {
    flex: 1,
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 12
  },
  label: {
    color: '#94a3b8',
    fontWeight: '600'
  },
  word: {
    color: '#f8fafc',
    fontSize: 24,
    letterSpacing: 4,
    marginTop: 8
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  input: {
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    padding: 10,
    borderRadius: 8,
    width: 150,
    textAlign: 'center',
    marginRight: 8
  },
  btn: {
    backgroundColor: '#06b6d4',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnText: {
    color: '#0f172a',
    fontWeight: '700'
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8
  },
  key: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  keyText: {
    fontWeight: '700',
    color: '#0f172a'
  },
  keyUsed: {
    opacity: 0.5
  },
  keyWrong: {
    backgroundColor: '#f43f5e'
  },
  triedRow: {
    marginTop: 8
  },
  small: {
    color: '#cbd5e1'
  },
  resultBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#0b1220',
    alignItems: 'center'
  },
  winTitle: {
    color: '#4ade80',
    fontSize: 20,
    fontWeight: '800'
  },
  loseTitle: {
    color: '#f43f5e',
    fontSize: 20,
    fontWeight: '800'
  },
  resultWord: {
    color: '#f8fafc',
    marginTop: 6,
    fontSize: 16
  }
});
