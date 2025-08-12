import { useEffect, useRef } from 'react';
import { Box, Container, Heading, Text, VStack, Button } from '@chakra-ui/react';

export default function TestMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadKakaoMap = () => {
      console.log('테스트: 카카오맵 로딩 시작');
      console.log('API 키:', process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY);
      console.log('API 키 길이:', process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY?.length);
      console.log('API 키 타입:', typeof process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY);
      
      // API 키 유효성 검사
      if (!process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY) {
        console.error('API 키가 설정되지 않았습니다!');
        return;
      }
      
      if (process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY === 'YOUR_KAKAO_MAP_API_KEY_HERE') {
        console.error('기본 API 키가 설정되어 있습니다. 실제 키로 변경해주세요.');
        return;
      }
      
      // API 키 형식 검사 (카카오 JavaScript 키는 보통 32자)
      if (process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY.length !== 32) {
        console.error('API 키 길이가 올바르지 않습니다. JavaScript 키는 32자여야 합니다.');
        return;
      }
      
      // API 키가 16진수 형식인지 확인
      const hexRegex = /^[0-9a-f]{32}$/i;
      if (!hexRegex.test(process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY)) {
        console.error('API 키 형식이 올바르지 않습니다. 16진수 32자여야 합니다.');
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
      script.async = true;
      
      console.log('스크립트 URL:', script.src);
      
      script.onload = () => {
        console.log('테스트: 카카오맵 스크립트 로드 성공');
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            console.log('테스트: 카카오맵 초기화 성공');
            
            // 서울 시청을 중심으로 간단한 지도 생성
            const map = new window.kakao.maps.Map(mapRef.current, {
              center: new window.kakao.maps.LatLng(37.5665, 126.9780),
              level: 3
            });
            
            console.log('테스트: 지도 생성 완료');
          });
        } else {
          console.error('테스트: 카카오맵 객체를 찾을 수 없음');
        }
      };
      
      script.onerror = (error) => {
        console.error('테스트: 카카오맵 스크립트 로드 실패:', error);
        console.error('실패한 URL:', script.src);
        
        // 네트워크 오류인지 확인
        fetch(script.src)
          .then(response => {
            console.log('스크립트 URL 응답:', response.status, response.statusText);
          })
          .catch(fetchError => {
            console.error('스크립트 URL fetch 실패:', fetchError);
          });
      };
      
      document.head.appendChild(script);
    };

    loadKakaoMap();
  }, []);

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6}>
        <Heading>카카오맵 API 테스트</Heading>
        <Text>API 키: {process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}</Text>
        
        <Box
          ref={mapRef}
          w="100%"
          h="400px"
          border="2px solid"
          borderColor="gray.300"
          borderRadius="lg"
        />
        
        <Button
          onClick={() => window.location.reload()}
          colorScheme="teal"
        >
          새로고침
        </Button>
      </VStack>
    </Container>
  );
} 