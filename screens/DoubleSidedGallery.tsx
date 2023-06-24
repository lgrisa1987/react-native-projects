import React, {useState, useEffect, useRef} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {API_KEY} from 'react-native-dotenv';
import {Photo} from '../types/photos';

const {width, height} = Dimensions.get('screen');
const IMAGE_SIZE = 80;
const SPACING = 10;
const API_URL =
  'https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20';

const fetchDataFromPexels = async () => {
  const data = await fetch(API_URL, {headers: {Authorization: API_KEY}});
  const {photos} = await data.json();
  return photos;
};

const DoubleSidedGallery = (): JSX.Element => {
  const [images, setImages] = useState<Photo[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const topRef = useRef<FlatList<Photo>>(null);
  const thumbRef = useRef<FlatList<Photo>>(null);
  const scrollToActiveIndex = (index: number) => {
    const condition =
      index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2;
    setActiveIndex(index);
    topRef.current?.scrollToOffset({offset: index * width, animated: true});
    /* if (index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2) */
    thumbRef.current?.scrollToOffset({
      offset:
        !index || index === 1
          ? 0
          : condition
          ? index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2
          : IMAGE_SIZE / 2,
      animated: true,
    });
  };

  useEffect(() => {
    const fetchImages = async () => setImages(await fetchDataFromPexels());
    fetchImages();
  }, []);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
      <FlatList
        ref={topRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e =>
          scrollToActiveIndex(Math.floor(e.nativeEvent.contentOffset.x / width))
        }
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={{width, height}}>
            <Image
              source={{uri: item.src.portrait}}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        )}
      />
      <FlatList
        ref={thumbRef}
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{paddingHorizontal: SPACING}}
        renderItem={({item, index}) => (
          <TouchableOpacity onPress={() => scrollToActiveIndex(index)}>
            <Image
              source={{uri: item.src.portrait}}
              style={{
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                borderRadius: 12,
                marginRight: SPACING,
                borderWidth: 2,
                borderColor: activeIndex === index ? '#fff' : 'transparent',
              }}
            />
          </TouchableOpacity>
        )}
        style={{position: 'absolute', bottom: IMAGE_SIZE / 2}}
      />
    </SafeAreaView>
  );
};

export default DoubleSidedGallery;
