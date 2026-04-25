import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  TouchableOpacity, Modal, ScrollView, RefreshControl,
   Dimensions, Animated, PanResponder
} from 'react-native';
import {
  getFirestore, collection, query,
  where, orderBy, onSnapshot
} from '@react-native-firebase/firestore';
import { useAppTheme } from '../../themes';
import { useAuth } from '../../contexts/AuthContext';
import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';

export default function AgendaScreen() {
  const theme = useAppTheme();
  const { role } = useAuth();
  const s = makeStyles(theme);

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detalhe, setDetalhe] = useState(null);

  // ─── Lógica de Notificação ──────────────────────────────────────────

  const agendarLembretesEvento = async (item) => {
    const agora = new Date();
    const dataEvento = item.inicioJS;
    const intervalos = [7, 3, 1, 0];

    try {
      // Limpeza de IDs anteriores para garantir idempotência
      for (const dias of intervalos) {
        await notifee.cancelNotification(`${item.id}-${dias}`);
      }

      for (const dias of intervalos) {
        const dataAlvo = new Date(dataEvento);
        dataAlvo.setDate(dataAlvo.getDate() - dias);
        dataAlvo.setHours(9, 0, 0, 0);

        if (dataAlvo > agora) {
          const trigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: dataAlvo.getTime(),
            alarmManager: true,
          };

          await notifee.createTriggerNotification(
            {
              id: `${item.id}-${dias}`,
              title: dias === 0 ? `Hoje: ${item.name}` : `Lembrete: ${item.name}`,
              body: dias === 0 
                ? `O evento começa hoje às ${item.inicioJS.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`
                : `Faltam ${dias} ${dias === 1 ? 'dia' : 'dias'} para o evento.`,
              android: {
                channelId: 'eventos_lembretes',
                importance: AndroidImportance.HIGH,
                pressAction: { id: 'default' },
              },
            },
            trigger
          );
        }
      }
    } catch (error) {
      console.error(`Falha no agendamento: ${item.name}`, error);
    }
  };

  // ─── Listener em Tempo Real (dataStream) ──────────────────────────────

  const iniciarListener = useCallback(() => {
    const db = getFirestore();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataStream = query(
      collection(db, 'agenda'),
      where('status', '==', 'ativo'),
      orderBy('dateStart', 'asc')
    );

    const unsub = onSnapshot(dataStream, async (snap) => {
      const list = [];
      const agora = new Date();

      snap.forEach((doc) => {
        const data = doc.data();
        const inicio = data.dateStart?.toDate?.();
        const fim = data.dateEnd?.toDate?.() ?? inicio;

        if (!inicio || fim < hoje) return;

        // Regras de Visibilidade (Autorização)
        const isAuthorized = 
          (data.visibility === 0) || 
          (data.visibility === 1 && (role === 'membro' || role === 'admin')) || 
          (role === 'admin'); // visibility 2

        if (!isAuthorized) return;

        const diasFaltando = Math.ceil((inicio - hoje) / (1000 * 60 * 60 * 24));

        list.push({ 
          id: doc.id, 
          ...data, 
          title: data.name, // Mapeamento correto do Firebase
          inicioJS: inicio, 
          fimJS: fim, 
          diasFaltando 
        });
      });

      setEventos(list);

      // Processamento assíncrono de notificações
      for (const item of list) {
        if (item.inicioJS > agora) {
          await agendarLembretesEvento(item);
        }
      }

      setLoading(false);
      setRefreshing(false);
    }, (err) => {
      console.error('Erro no fluxo de dados:', err);
      setLoading(false);
    });

    return unsub;
  }, [role]);

  useEffect(() => {
    const unsub = iniciarListener();
    return unsub;
  }, [iniciarListener]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  // ─── Renderização ──────────────────────────────────────────────────

  const renderItem = ({ item }) => {
    const { inicioJS: inicio, fimJS: fim } = item;
    if (!inicio) return null;

    const multiDia = fim && inicio.toLocaleDateString() !== fim.toLocaleDateString();
    const visIcon = item.visibility === 1 ? ' 👥' : item.visibility === 2 ? ' 🔒' : '';

    return (
      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.surfaceVariant }]}
        onPress={() => setDetalhe(item)}
        activeOpacity={0.85}
      >
        <View style={s.dateContainer}>
          <View style={[s.dateBadge, { backgroundColor: theme.primary }]}>
            <Text style={s.dateText}>{inicio.getDate()}</Text>
            <Text style={s.monthText}>
              {inicio.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
            </Text>
          </View>
          <Text style={[s.diasRestantes, { color: theme.primary }]}>
            {item.diasFaltando === 0 ? 'HOJE' : `Em ${item.diasFaltando}d`}
          </Text>
        </View>

        <View style={s.infoContainer}>
          <Text style={[s.eventName, { color: theme.text }]} numberOfLines={2}>
            {item.title}{visIcon}
          </Text>
          <View style={s.detailRow}>
            <Text style={[s.detailIcon, { color: theme.primary }]}>📅</Text>
            <Text style={[s.detailText, { color: theme.textSecondary }]}>
              {inicio.toLocaleDateString('pt-BR')}
              {multiDia ? ` até ${fim.toLocaleDateString('pt-BR')}` : ''}
            </Text>
          </View>
          <View style={s.detailRow}>
            <Text style={[s.detailIcon, { color: theme.primary }]}>🕐</Text>
            <Text style={[s.detailText, { color: theme.textSecondary }]}>
              {inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
        <Text style={[s.arrow, { color: theme.textDisabled }]}>›</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={eventos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListHeaderComponent={<Text style={[s.title, { color: theme.primary }]}>AGENDA</Text>}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📅</Text>
            <Text style={[s.emptyText, { color: theme.textSecondary }]}>Nenhum evento programado.</Text>
          </View>
        }
      />
      {detalhe && (
        <EventoModal evento={detalhe} theme={theme} onClose={() => setDetalhe(null)} />
      )}
    </View>
  );
}

// ─── Modal de detalhe ────────────────────────────────────────────────────────

function EventoModal({ evento, theme, onClose }) {
  const s = makeStyles(theme);
  const screenHeight = Dimensions.get('window').height;
  
  // Valor animado para a posição Y
  const panY = React.useRef(new Animated.Value(0)).current;

  // Configuração do PanResponder para detectar o gesto
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Permite arrastar apenas para baixo (positivo)
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Se arrastou mais de 100px, fecha. Senão, volta ao topo.
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <Animated.View 
          style={[
            s.modalSheet, 
            { transform: [{ translateY: panY }] } // Vincula a animação ao movimento
          ]}
        >
          {/* A "alça" (handle) agora é a área sensível ao toque para arrastar */}
          <View {...panResponder.panHandlers} style={s.modalHandleContainer}>
            <View style={s.modalHandle} />
          </View>

          <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={[s.modalTitle, { color: theme.text }]}>{evento.title}</Text>
            {/* ... Restante do conteúdo (Data, Local, etc) igual ao anterior ... */}
            
            <ModalRow icon="📅" label="DATA" theme={theme}>
               <Text style={[s.modalRowValue, { color: theme.text }]}>
                 {evento.inicioJS?.toLocaleDateString('pt-BR')}
               </Text>
            </ModalRow>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function ModalRow({ icon, label, theme, children }) {
  const s = makeStyles(theme);
  return (
    <View style={s.modalRow}>
      <Text style={s.modalRowIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[s.modalRowLabel, { color: theme.primary }]}>{label}</Text>
        {children}
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

function makeStyles(theme) {
  return StyleSheet.create({
    container:   { flex: 1 },
    center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20, paddingBottom: 48 },
    title:       { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },

    // Card
    card: {
      flexDirection: 'row', alignItems: 'center',
      padding: 15, borderRadius: 12, marginBottom: 14, elevation: 2,
    },
    dateContainer: { alignItems: 'center', marginRight: 14 },
    dateBadge: {
      width: 55, height: 55, borderRadius: 10,
      justifyContent: 'center', alignItems: 'center',
    },
    dateText:     { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    monthText:    { color: '#FFF', fontSize: 10 },
    diasRestantes:{ fontSize: 10, fontWeight: 'bold', marginTop: 5 },
    infoContainer:{ flex: 1 },
    eventName:    { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    detailRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    detailIcon:   { fontSize: 12, marginRight: 5 },
    detailText:   { fontSize: 13 },
    arrow:        { fontSize: 24, paddingLeft: 8 },

    // Empty
    empty:     { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyIcon: { fontSize: 40 },
    emptyText: { fontSize: 15 },

    // Modal
    modalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      maxHeight: '85%',
    },
    modalHandleContainer: {
  width: '100%',
  height: 30, // Área invisível maior para facilitar o toque
  justifyContent: 'center',
  alignItems: 'center',
},
    modalHandle: {
  width: 40,
  height: 5,
  borderRadius: 3,
  backgroundColor: theme.border,
},
    modalBody:  { padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, lineHeight: 26 },
    modalRow: {
      flexDirection: 'row', gap: 12, marginBottom: 18,
    },
    modalRowIcon:  { fontSize: 20, marginTop: 2 },
    modalRowLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
    modalRowValue: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
    modalRowSub:   { fontSize: 13, marginTop: 2 },
    descBox: {
      borderRadius: 10, padding: 14, marginBottom: 16,
      borderLeftWidth: 3, borderLeftColor: theme.primary,
    },
    descText:    { fontSize: 14, lineHeight: 22 },
    visBadgeRow: { flexDirection: 'row' },
    visBadge: {
      borderRadius: 8, borderWidth: 1,
      paddingHorizontal: 10, paddingVertical: 4,
    },
    visBadgeText: { fontSize: 12, fontWeight: '600' },
    modalFooter: {
      padding: 16, borderTopWidth: 1, borderTopColor: theme.divider,
    },
    fecharBtn: {
      borderRadius: 12, borderWidth: 1,
      paddingVertical: 13, alignItems: 'center',
    },
    fecharBtnText: { fontSize: 15, fontWeight: '600' },
  });
}