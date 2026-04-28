import React from 'react';
import {
  View, Text, Modal, ScrollView,
  TouchableOpacity, StyleSheet
} from 'react-native';

export default function EventoModal({ evento, theme, onClose }) {
  if (!evento) return null;

  return (
    <Modal
      visible={!!evento}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Toque  fecha */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        
        <TouchableOpacity
          style={[styles.sheet, { backgroundColor: theme.surface }]}
          activeOpacity={1}
          onPress={onClose}
        >
          {/* Alça visual */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              {evento.title}
            </Text>

            <Row icon="📅" label="DATA" theme={theme}>
              <Text style={[styles.value, { color: theme.text }]}>
                {evento.inicioJS?.toLocaleDateString('pt-BR', {
                  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                })}
              </Text>
            </Row>

            <Row icon="🕐" label="HORÁRIO" theme={theme}>
              <Text style={[styles.value, { color: theme.text }]}>
                {evento.inicioJS?.toLocaleTimeString('pt-BR', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </Text>
            </Row>

            {evento.address ? (
              <Row icon="📍" label="LOCAL" theme={theme}>
                <Text style={[styles.value, { color: theme.text }]}>{evento.address}</Text>
              </Row>
            ) : null}

            {evento.description ? (
              <Row icon="📝" label="DESCRIÇÃO" theme={theme}>
                <Text style={[styles.desc, { color: theme.textSecondary }]}>
                  {evento.description}
                </Text>
              </Row>
            ) : null}

            <View style={{ height: 20 }} />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function Row({ icon, label, theme, children }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: theme.primary }]}>{label}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    maxHeight: '85%',
  },
  handleContainer: {
    width: '100%',
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: 40, height: 5, borderRadius: 3,
  },
  body: {
    padding: 20,
  },
  title: {
    fontSize: 20, fontWeight: '700', marginBottom: 20, lineHeight: 26,
  },
  row: {
    flexDirection: 'row', gap: 12, marginBottom: 18,
  },
  rowIcon:  { fontSize: 20, marginTop: 2 },
  rowLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  value:    { fontSize: 15, fontWeight: '500', lineHeight: 20 },
  desc:     { fontSize: 14, lineHeight: 22 },
});