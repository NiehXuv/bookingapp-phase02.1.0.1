import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Play, Heart, MessageCircle } from 'lucide-react-native';
import { contentService } from '../services/contentService';
import { useSearchContext } from '../context/SearchContext';
import { ContentItem } from '../types/content';

const { width } = Dimensions.get('window');
const CARD_RADIUS = 16;
const GAP = 10;
const COLUMN_WIDTH = (width - 32 - GAP) / 2;

interface RouteParams {
  query: string;
}



const SearchContentResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { query } = (route.params as RouteParams) || { query: '' };
  
  // 🚀 Use SearchContext for persistent state
  const {
    contentResults,
    setContentResults,
    isLoadingContent,
    setIsLoadingContent,
    lastContentQuery,
    setLastContentQuery
  } = useSearchContext();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 🚀 Check if we already have results for this query (cache hit)
    if (query === lastContentQuery && contentResults.length > 0) {
      console.log(`⚡ Content cache hit for "${query}": ${contentResults.length} results`);
      setIsLoadingContent(false);
      return;
    }

    const run = async () => {
      setIsLoadingContent(true);
      setError(null);
      try {
        console.log(`🔍 Content search started for: "${query}"`);
        const items = await contentService.searchContent(query, ['YouTube Shorts', 'TripAdvisor', 'Pixabay', 'Pexels']);
        // Deduplicate by id
        const seen = new Set<string>();
        const unique = items.filter(it => (seen.has(it.id) ? false : (seen.add(it.id), true)));
        
        setContentResults(unique as ContentItem[]);
        setLastContentQuery(query);
        console.log(`✅ Content search completed: ${unique.length} results`);
      } catch (e: any) {
        console.log(`❌ Content search failed: ${e?.message || e}`);
        setError(e?.message || 'Failed to search content');
      } finally {
        setIsLoadingContent(false);
      }
    };
    
    if (query) {
      run();
    }
  }, [query, lastContentQuery, contentResults.length, setContentResults, setIsLoadingContent, setLastContentQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search: {query}</Text>
      </View>

      {isLoadingContent ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Searching content...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.masonryRow}>
            <View style={styles.column}>
              {contentResults.filter((_, i) => i % 2 === 0).map((item, idx) => (
                <View key={`${item.id}_${idx}`} style={styles.tile}>
                  <TouchableOpacity onPress={() => {
                    console.log('🔍 Navigating to DetailScreen with item:', {
                      id: item.id,
                      title: item.title,
                      source: item.source,
                      imageUrl: item.imageUrl,
                      hasOriginalUrl: !!item.originalUrl
                    });
                    (navigation as any).navigate('DetailScreen', { item });
                  }} activeOpacity={0.9}>
                  <View style={[styles.card, idx % 2 === 0 ? styles.cardTall : styles.cardShort]}>
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                    {item.isShort && (
                      <View style={styles.playButton}>
                        <Play size={18} color="#fff" />
                      </View>
                    )}
                    {item.duration && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{item.duration}</Text>
                      </View>
                    )}
                    <View style={styles.pill}>
                      <View style={styles.pillItem}>
                        <Heart size={12} color="#fff" />
                        <Text style={styles.pillText}>{item.engagement?.likes ?? 0}</Text>
                      </View>
                      <View style={styles.pillItem}>
                        <MessageCircle size={12} color="#fff" />
                        <Text style={styles.pillText}>{item.engagement?.comments ?? 0}</Text>
                      </View>
                    </View>
                  </View>
                  </TouchableOpacity>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.sourceTag}>{item.source}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.column}>
              {contentResults.filter((_, i) => i % 2 !== 0).map((item, idx) => (
                <View key={`${item.id}_${idx}`} style={styles.tile}>
                  <TouchableOpacity onPress={() => {
                    console.log('🔍 Navigating to DetailScreen with item:', {
                      id: item.id,
                      title: item.title,
                      source: item.source,
                      imageUrl: item.imageUrl,
                      hasOriginalUrl: !!item.originalUrl
                    });
                    (navigation as any).navigate('DetailScreen', { item });
                  }} activeOpacity={0.9}>
                  <View style={[styles.card, idx % 2 === 1 ? styles.cardTall : styles.cardShort]}>
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                    {item.isShort && (
                      <View style={styles.playButton}>
                        <Play size={18} color="#fff" />
                      </View>
                    )}
                    {item.duration && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{item.duration}</Text>
                      </View>
                    )}
                    <View style={styles.pill}>
                      <View style={styles.pillItem}>
                        <Heart size={12} color="#fff" />
                        <Text style={styles.pillText}>{item.engagement?.likes ?? 0}</Text>
                      </View>
                      <View style={styles.pillItem}>
                        <MessageCircle size={12} color="#fff" />
                        <Text style={styles.pillText}>{item.engagement?.comments ?? 0}</Text>
                      </View>
                    </View>
                  </View>
                  </TouchableOpacity>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.sourceTag}>{item.source}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', 
    paddingTop: 50 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginBottom: 16,
    paddingVertical: 8,
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#4CBC71',
    flex: 1,
  },
  loadingContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  loadingText: { 
    marginTop: 16, 
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: { 
    color: '#DC2626', 
    paddingHorizontal: 16, 
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  masonryRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    gap: GAP 
  },
  column: { 
    flex: 1, 
    gap: GAP 
  },
  tile: {},
  card: {
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(76, 188, 113, 0.1)',
  },
  cardTall: { 
    height: COLUMN_WIDTH * 1.25 
  },
  cardShort: { 
    height: COLUMN_WIDTH * 0.9 
  },
  cardImage: { 
    width: '100%', 
    height: '100%' 
  },
  playButton: { 
    position: 'absolute', 
    top: 12, 
    right: 12, 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  durationBadge: { 
    position: 'absolute', 
    bottom: 12, 
    right: 12, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  durationText: { 
    color: '#fff', 
    fontSize: 11, 
    fontWeight: '700' 
  },
  pill: { 
    position: 'absolute', 
    bottom: 8, 
    left: 8, 
    right: 8, 
    flexDirection: 'row', 
    gap: 6 
  },
  pillItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12, 
    backgroundColor: 'rgba(17,24,39,0.55)' 
  },
  pillText: { 
    color: '#fff', 
    fontSize: 11, 
    fontWeight: '700' 
  },
  metaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 6, 
    marginTop: 8 
  },
  metaTitle: { 
    flex: 1, 
    color: '#111827', 
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
  },
  sourceTag: { 
    marginLeft: 8, 
    color: '#4CBC71', 
    fontWeight: '600', 
    fontSize: 12,
    backgroundColor: 'rgba(76, 188, 113, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});

export default SearchContentResultScreen;


