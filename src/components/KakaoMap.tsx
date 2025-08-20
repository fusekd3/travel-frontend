import { useEffect, useRef, useState } from 'react';
import { Box, Text, VStack, HStack, Badge, Icon, Spinner } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock, FaPhone, FaGlobe } from 'react-icons/fa';

interface Spot {
  id: number;
  name: string;
  address: string;
  category: string;
  time?: string;
  tel?: string;
  homepage?: string;
  price?: number;
}

interface KakaoMapProps {
  spots: Spot[];
  height?: string;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({ spots, height = "400px" }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [openedMarker, setOpenedMarker] = useState<any>(null);

  useEffect(() => {
    // 1. initMap을 먼저 선언
    const initMap = () => {
      if (!mapRef.current) {
        setMapError('지도 컨테이너를 찾을 수 없습니다.');
        setMapLoading(false);
        return;
      }
      
      if (spots.length === 0) {
        setMapError('표시할 여행지가 없습니다.');
        setMapLoading(false);
        return;
      }

      // 첫 번째 여행지를 중심으로 지도 생성
      const firstSpot = spots[0];
      
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(firstSpot.address, (result: any, status: any) => {
        
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          
          const mapInstance = new window.kakao.maps.Map(mapRef.current, {
            center: coords,
            level: 8
          });

          setMap(mapInstance);
          setMapLoading(false);

          // 모든 여행지에 마커 추가
          spots.forEach((spot, index) => {
            geocoder.addressSearch(spot.address, (result: any, status: any) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                
                // 마커 생성
                const marker = new window.kakao.maps.Marker({
                  position: coords,
                  map: mapInstance
                });

                // 마커 이미지 설정 (카테고리별 다른 색상)
                const getMarkerImage = (category: string) => {
                  const colors = {
                    '숙소': '#FF6B6B',
                    '식당': '#4ECDC4',
                    '관광지': '#45B7D1',
                    '카페': '#96CEB4',
                    '기타': '#FFEAA7'
                  };
                  
                  const color = colors[category as keyof typeof colors] || colors['기타'];
                  
                  return new window.kakao.maps.MarkerImage(
                    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}"/>
                        <circle cx="12" cy="9" r="2.5" fill="white"/>
                      </svg>
                    `)}`,
                    new window.kakao.maps.Size(24, 24)
                  );
                };

                marker.setImage(getMarkerImage(spot.category));

                // 인포윈도우 생성
                const infowindow = new window.kakao.maps.InfoWindow({
                  content: `
                    <div style="padding: 10px; min-width: 200px;">
                      <h3 style="margin: 0 0 5px 0; color: #2D3748; font-weight: bold;">${spot.name}</h3>
                      <p style="margin: 0 0 3px 0; color: #4A5568; font-size: 12px;">${spot.address}</p>
                      <span style="background: #E6FFFA; color: #2C7A7B; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${spot.category}</span>
                      ${spot.time ? `<p style="margin: 3px 0 0 0; color: #718096; font-size: 11px;">⏰ ${spot.time}</p>` : ''}
                    </div>
                  `
                });

                // 마커 클릭 이벤트 (토글)
                let isOpen = false;
                window.kakao.maps.event.addListener(marker, 'click', () => {
                  if (isOpen) {
                    // 이미 열려있으면 닫기
                    infowindow.close();
                    isOpen = false;
                    setSelectedSpot(null);
                  } else {
                    // 닫혀있으면 열기
                    if (openedMarker) {
                      openedMarker.infowindow.close();
                    }
                    infowindow.open(mapInstance, marker);
                    setOpenedMarker({ marker, infowindow });
                    setSelectedSpot(spot);
                    isOpen = true;
                  }
                });

              } else {
                console.error(`마커 ${index + 1} 주소 검색 실패:`, spot.address, status);
              }
            });
          });

          // 지도 범위 조정
          const bounds = new window.kakao.maps.LatLngBounds();
          spots.forEach((_, idx) => {
            if (idx < spots.length) {
              geocoder.addressSearch(spots[idx].address, (result: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                  bounds.extend(new window.kakao.maps.LatLng(result[0].y, result[0].x));
                  if (idx === spots.length - 1) {
                    mapInstance.setBounds(bounds);
                  }
                }
              });
            }
          });
        } else {
          console.error('첫 번째 여행지 주소 검색 실패:', firstSpot.address, status);
          setMapError('여행지 주소를 찾을 수 없습니다.');
          setMapLoading(false);
        }
      });
    };

    // 2. 그 다음 loadKakaoMap에서 사용
    const loadKakaoMap = () => {
      setMapLoading(true);
      setMapError(null);
      
      if (window.kakao && window.kakao.maps) {
        initMap();
      } else {
        
        // 기존 스크립트가 있는지 확인하고 제거
        const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
        if (existingScript) {
          existingScript.remove();
        }
        
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
              initMap();
            });
          } else {
            console.error('카카오맵 객체를 찾을 수 없습니다');
            setMapError('카카오맵을 초기화할 수 없습니다.');
            setMapLoading(false);
          }
        };
        
        script.onerror = (error) => {
          console.error('카카오맵 스크립트 로드 실패:', error);
          setMapError('카카오맵을 불러올 수 없습니다. API 키와 도메인 설정을 확인해주세요.');
          setMapLoading(false);
        };
        
        document.head.appendChild(script);
      }
    };

    // 여행지가 있을 때만 지도 로드
    if (spots.length > 0) {
      loadKakaoMap();
    } else {
      setMapError('표시할 여행지가 없습니다.');
      setMapLoading(false);
    }
  }, [spots]);

  return (
    <VStack spacing={4} align="stretch">
      {/* 지도 컨테이너 */}
      <Box
        ref={mapRef}
        w="100%"
        h={height}
        borderRadius="lg"
        overflow="hidden"
        border="1px"
        borderColor="gray.200"
        position="relative"
      >
        {/* 로딩 상태 */}
        {mapLoading && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1}
          >
            <VStack spacing={4}>
              <Spinner size="xl" thickness="6px" color="teal.400" speed="0.8s" />
              <Text color="gray.600">지도를 불러오는 중...</Text>
            </VStack>
          </Box>
        )}

        {/* 오류 상태 */}
        {mapError && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="gray.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1}
          >
            <VStack spacing={4} textAlign="center">
              <Icon as={FaMapMarkerAlt} w={12} h={12} color="gray.400" />
              <Text color="gray.600" fontSize="lg">
                {mapError}
              </Text>
              <Text color="gray.500" fontSize="sm">
                여행지 목록을 확인해주세요
              </Text>
              
              {/* 여행지 목록 표시 */}
              {spots.length > 0 && (
                <Box mt={4} p={4} bg="white" borderRadius="md" maxH="200px" overflowY="auto">
                  <Text fontWeight="bold" mb={2} color="teal.700">
                    방문 예정지 ({spots.length}개)
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {spots.map((spot, idx) => (
                      <Box key={idx} p={2} bg="gray.50" borderRadius="sm">
                        <Text fontSize="sm" fontWeight="bold" color="teal.600">
                          {spot.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {spot.address}
                        </Text>
                        <Badge colorScheme="teal" variant="subtle" size="sm">
                          {spot.category}
                        </Badge>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>
        )}
      </Box>

      {/* 선택된 여행지 상세 정보 */}
      {selectedSpot && (
        <Box p={4} bg="teal.50" borderRadius="lg" border="1px" borderColor="teal.200">
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text fontWeight="bold" color="teal.700" fontSize="lg">
                {selectedSpot.name}
              </Text>
              <Badge colorScheme="teal" variant="solid">
                {selectedSpot.category}
              </Badge>
            </HStack>
            
            <HStack>
              <Icon as={FaMapMarkerAlt} color="teal.500" />
              <Text fontSize="sm" color="gray.700">
                {selectedSpot.address}
              </Text>
            </HStack>
            
            {selectedSpot.time && (
              <HStack>
                <Icon as={FaClock} color="teal.500" />
                <Text fontSize="sm" color="gray.700">
                  {selectedSpot.time}
                </Text>
              </HStack>
            )}
            
            {selectedSpot.tel && (
              <HStack>
                <Icon as={FaPhone} color="teal.500" />
                <Text fontSize="sm" color="gray.700">
                  {selectedSpot.tel}
                </Text>
              </HStack>
            )}
            
            {selectedSpot.homepage && (
              <HStack>
                <Icon as={FaGlobe} color="teal.500" />
                <Text fontSize="sm" color="teal.600" cursor="pointer">
                  홈페이지
                </Text>
              </HStack>
            )}
            
            {selectedSpot.price && (
              <Text fontSize="sm" color="gray.700">
                💰 예상 비용: {selectedSpot.price.toLocaleString()}원
              </Text>
            )}
          </VStack>
        </Box>
      )}
    </VStack>
  );
} 