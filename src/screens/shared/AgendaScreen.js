// screens/shared/AgendaScreen.js
//
// Correções aplicadas sobre a versão original:
//   - firestore() → getFirestore() (API modular, padrão do projeto)
//   - item.name  → item.title (campo correto conforme contexto técnico)
//   - Adicionado modal de detalhe ao tocar no card
//   - Adicionado estado vazio e pull-to-refresh

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  TouchableOpacity, Modal, ScrollView, RefreshControl,
} from 'react-native';
import {
  getFirestore, collection, query,
  where, orderBy, onSnapshot,
} from '@react-native-firebase/firestore';
import { useAppTheme } from '../../themes';
import { useAuth }     from '../../contexts/AuthContext';

export default function AgendaScreen() {
  const theme           = useAppTheme();
  const { role }        = useAuth();
  const s               = makeStyles(theme);

  const [eventos,    setEventos]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detalhe,    setDetalhe]    = useState(null);

  // ─── Listener em tempo real ──────────────────────────────────────────────

  const iniciarListener = useCallback(() => {
    const db   = getFirestore();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'agenda'),
      where('status', '==', 'ativo'),
      orderBy('dateStart', 'asc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = [];

      snap.forEach((doc) => {
        const data  = doc.data();
        const inicio = data.dateStart?.toDate?.();
        const fim    = data.dateEnd?.toDate?.() ?? inicio;

        // Filtra eventos já encerrados
        if (!inicio || fim < hoje) return;

        // Filtra por visibilidade conforme role
        let podeVer = false;
        if (data.visibility === 0) podeVer = true;
        if (data.visibility === 1 && (role === 'membro' || role === 'admin')) podeVer = true;
        if (data.visibility === 2 && role === 'admin') podeVer = true;

        if (!podeVer) return;

        const diasFaltando = Math.ceil((inicio - hoje) / (1000 * 60 * 60 * 24));

        list.push({ id: doc.id, ...data, inicioJS: inicio, fimJS: fim, diasFaltando });
      });

      setEventos(list);
      setLoading(false);
      setRefreshing(false);
    }, (err) => {
      console.error('AgendaScreen - erro:', err);
      setLoading(false);
      setRefreshing(false);
    });

    return unsub;
  }, [role]);

  useEffect(() => {
    const unsub = iniciarListener();
    return unsub;
  }, [iniciarListener]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // onSnapshot já vai re-disparar; setRefreshing(false) acontece no callback
  }, []);

  // ─── Render item ─────────────────────────────────────────────────────────

  const renderItem = ({ item }) => {
    const { inicioJS: inicio, fimJS: fim } = item;
    if (!inicio || !(inicio instanceof Date)) return null;

    const multiDia = fim && inicio.toLocaleDateString() !== fim.toLocaleDateString();
    const visIcon  = item.visibility === 1 ? ' 👥' : item.visibility === 2 ? ' 🔒' : '';

    return (
      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.surfaceVariant }]}
        onPress={() => setDetalhe(item)}
        activeOpacity={0.85}
      >
        {/* Badge de data */}
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

        {/* Info */}
        <View style={s.infoContainer}>
          <Text style={[s.eventName, { color: theme.text }]} numberOfLines={2}>
            {/* ← CORREÇÃO: era item.name, campo correto é item.title */}
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
              {multiDia && fim
                ? ` — término: ${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : ''}
            </Text>
          </View>

          {item.location && (
            <View style={s.detailRow}>
              <Text style={[s.detailIcon, { color: theme.primary }]}>📍</Text>
              <Text style={[s.detailText, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          )}
        </View>

        <Text style={[s.arrow, { color: theme.textDisabled }]}>›</Text>
      </TouchableOpacity>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListHeaderComponent={
          <Text style={[s.title, { color: theme.primary }]}>AGENDA</Text>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📅</Text>
            <Text style={[s.emptyText, { color: theme.textSecondary }]}>
              Nenhum evento programado.
            </Text>
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
  const s      = makeStyles(theme);
  const inicio = evento.inicioJS;
  const fim    = evento.fimJS;

  const fmtDataLonga = (d) =>
    d?.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
  const fmtHora = (d) =>
    d?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const multiDia = fim && inicio?.toLocaleDateString() !== fim?.toLocaleDateString();
  const visLabels = ['Público', 'Membros e Admins', 'Apenas Admins'];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />

          <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={[s.modalTitle, { color: theme.text }]}>{evento.title}</Text>

            {/* Data / horário */}
            {inicio && (
              <ModalRow icon="📅" label="DATA" theme={theme}>
                <Text style={[s.modalRowValue, { color: theme.text }]}>
                  {fmtDataLonga(inicio)}
                </Text>
                <Text style={[s.modalRowSub, { color: theme.textSecondary }]}>
                  {fmtHora(inicio)}
                  {multiDia ? ` — ${fmtDataLonga(fim)}, ${fmtHora(fim)}` : fim ? ` até ${fmtHora(fim)}` : ''}
                </Text>
              </ModalRow>
            )}

            {/* Local */}
            {evento.location && (
              <ModalRow icon="📍" label="LOCAL" theme={theme}>
                <Text style={[s.modalRowValue, { color: theme.text }]}>{evento.location}</Text>
              </ModalRow>
            )}

            {/* Descrição */}
            {evento.description && (
              <View style={[s.descBox, { backgroundColor: theme.surfaceVariant }]}>
                <Text style={[s.descText, { color: theme.text }]}>{evento.description}</Text>
              </View>
            )}

            {/* Badge de visibilidade */}
            <View style={s.visBadgeRow}>
              <View style={[s.visBadge, { backgroundColor: theme.primary + '22', borderColor: theme.primary + '55' }]}>
                <Text style={[s.visBadgeText, { color: theme.primary }]}>
                  {visLabels[evento.visibility ?? 0]}
                </Text>
              </View>
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>

          <View style={s.modalFooter}>
            <TouchableOpacity
              style={[s.fecharBtn, { backgroundColor: theme.surfaceVariant, borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[s.fecharBtnText, { color: theme.text }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    modalHandle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: theme.border, alignSelf: 'center', marginTop: 12,
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