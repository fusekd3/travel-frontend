import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  SimpleGrid,
  Select,
  Image,
  Badge,
  useToast,
  Spinner,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt, FaStar, FaPhone, FaGlobe } from 'react-icons/fa';
import regionsData from '../data/korea_regions.json' assert { type: 'json' };

const regions: Record<string, string[]> = regionsData as any;

interface Spot {
  id: number;
  name: string;
  address: string;
  category: string;
  description: string;
  image_url: string;
  price: string;
  tel: string;
  homepage: string;
  open_time: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedSigungu, setSelectedSigungu] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const categories = [
    { value: '', label: '전체' },
    { value: '관광지', label: '관광지' },
    { value: '숙소', label: '숙소' },
    { value: '식당', label: '식당' },
  ];

  // URL 파라미터 처리 및 자동 검색
  useEffect(() => {
    if (router.isReady) {
      const { destination } = router.query;
      
      if (destination && typeof destination === 'string') {
        // destination 파라미터가 있으면 해당 지역을 찾아서 자동 선택
        const decodedDestination = decodeURIComponent(destination);
        console.log('자동 선택할 여행지:', decodedDestination);
        console.log('regions 데이터 확인:', regions);
        console.log('regions 키 목록:', Object.keys(regions));
        
        let foundSido = '';
        
        // 지역명으로 시/도 찾기 (정확한 매칭 우선)
        for (const [sido, sigunguList] of Object.entries(regions)) {
          console.log('비교 중:', { 
            sido, 
            decodedDestination, 
            'sido.includes(decodedDestination)': sido.includes(decodedDestination),
            'decodedDestination.includes(sido)': decodedDestination.includes(sido)
          });
          
          // 정확한 매칭 우선 (제주도 → 제주특별자치도)
          if (decodedDestination === '제주도' && sido === '제주특별자치도') {
            foundSido = sido;
            console.log('제주도 정확 매칭:', { sido: foundSido });
            break;
          }
          
          // 일반적인 포함 관계 확인
          if (sido.includes(decodedDestination) || decodedDestination.includes(sido)) {
            foundSido = sido;
            console.log('시/도에서 찾음:', { sido: foundSido });
            break;
          }
          
          // 시/군/구에서도 찾기
          for (const sigungu of sigunguList) {
            if (sigungu.includes(decodedDestination) || decodedDestination.includes(sigungu)) {
              foundSido = sido;
              console.log('시/군/구에서 찾음:', { sido: foundSido });
              break;
            }
          }
          
          if (foundSido) break;
        }
        
        // 찾은 지역 설정 (시/도만 선택, 시/군/구는 선택하지 않음)
        if (foundSido) {
          setSelectedSido(foundSido);
          setSelectedSigungu(''); // 시/군/구는 빈 값으로 설정
          console.log('최종 선택된 지역:', { sido: foundSido, sigungu: '' });
          
          // 자동으로 검색 실행 (검색어는 설정하지 않음) - foundSido 직접 전달
          setTimeout(() => {
            handleSearchWithSido(foundSido);
          }, 500);
        }
      }
    }
  }, [router.isReady, router.query]);

  const handleSearchWithSido = async (sido: string) => {
    setLoading(true);
    try {
      // 실제 API 호출
      const searchParams = new URLSearchParams();
      searchParams.append('sido', sido);
      if (selectedCategory) searchParams.append('category', selectedCategory);
      if (searchKeyword) searchParams.append('keyword', searchKeyword);

      const response = await fetch(`http://localhost:8000/api/search-spots?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('검색 요청에 실패했습니다.');
      }

      const data = await response.json();
      setSpots(data.spots || []);
      
      if (data.spots && data.spots.length === 0) {
        toast({
          title: '검색 결과가 없습니다',
          description: '다른 조건으로 검색해보세요.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: '검색 완료',
          description: `${data.spots?.length || 0}개의 여행지를 찾았습니다.`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('검색 오류:', error);
      toast({
        title: '검색 중 오류가 발생했습니다',
        description: '잠시 후 다시 시도해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedSido && !searchKeyword) {
      toast({
        title: '검색 조건을 입력해주세요',
        description: '지역을 선택하거나 검색어를 입력해주세요.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      // 실제 API 호출
      const searchParams = new URLSearchParams();
      if (selectedSido) searchParams.append('sido', selectedSido);
      if (selectedSigungu) searchParams.append('sigungu', selectedSigungu);
      if (selectedCategory) searchParams.append('category', selectedCategory);
      if (searchKeyword) searchParams.append('keyword', searchKeyword);

      const response = await fetch(`http://localhost:8000/api/search-spots?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('검색 요청에 실패했습니다.');
      }

      const data = await response.json();
      setSpots(data.spots || []);
      
      if (data.spots && data.spots.length === 0) {
        toast({
          title: '검색 결과가 없습니다',
          description: '다른 조건으로 검색해보세요.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: '검색 완료',
          description: `${data.spots?.length || 0}개의 여행지를 찾았습니다.`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('검색 오류:', error);
      toast({
        title: '검색 중 오류가 발생했습니다',
        description: '잠시 후 다시 시도해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* 검색 섹션 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={6}>
          <Heading size="lg" mb={6} color="teal.700">여행지 찾기</Heading>
          
          <VStack spacing={4}>
            {/* 지역 선택 */}
            <HStack spacing={4} w="100%" flexWrap="wrap">
              <Select
                placeholder="시/도 선택"
                value={selectedSido}
                onChange={(e) => {
                  setSelectedSido(e.target.value);
                  setSelectedSigungu('');
                }}
                flex={1}
                minW="200px"
              >
                {Object.keys(regions).map((sido) => (
                  <option key={sido} value={sido}>
                    {sido}
                  </option>
                ))}
              </Select>
              
              <Select
                placeholder="시/군/구 선택"
                value={selectedSigungu}
                onChange={(e) => setSelectedSigungu(e.target.value)}
                flex={1}
                minW="200px"
                isDisabled={!selectedSido}
              >
                {selectedSido &&
                  regions[selectedSido].map((sigungu) => (
                    <option key={sigungu} value={sigungu}>
                      {sigungu}
                    </option>
                  ))}
              </Select>
            </HStack>

            {/* 카테고리 및 검색어 */}
            <HStack spacing={4} w="100%" flexWrap="wrap">
              <Select
                placeholder="카테고리 선택"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                flex={1}
                minW="150px"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
              
              <Input
                placeholder="여행지명, 주소, 키워드 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                flex={2}
                minW="250px"
              />
              
              <Button
                colorScheme="teal"
                leftIcon={<FaSearch />}
                onClick={handleSearch}
                isLoading={loading}
                minW="100px"
              >
                검색
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* 검색 결과 */}
        {loading ? (
          <Box textAlign="center" py={16}>
            <Spinner size="xl" thickness="6px" color="teal.400" speed="0.8s" />
            <Text mt={4} color="gray.600">검색 중입니다...</Text>
          </Box>
        ) : spots.length > 0 ? (
          <Box>
            <Heading size="md" mb={4} color="teal.700">
              검색 결과 ({spots.length}개)
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {spots.map((spot) => (
                <Box
                  key={spot.id}
                  bg="white"
                  borderRadius="xl"
                  boxShadow="md"
                  overflow="hidden"
                  _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }}
                  transition="all 0.2s"
                >
                  <Image
                    src={spot.image_url}
                    alt={spot.name}
                    w="100%"
                    h="200px"
                    objectFit="cover"
                  />
                  <Box p={4}>
                    <HStack justify="space-between" mb={2}>
                      <Heading size="md" color="teal.700" noOfLines={1}>
                        {spot.name}
                      </Heading>
                      <Badge colorScheme="teal" variant="subtle">
                        {spot.category}
                      </Badge>
                    </HStack>
                    
                    <Text color="gray.600" fontSize="sm" mb={2} noOfLines={2}>
                      {spot.description}
                    </Text>
                    
                    <VStack align="stretch" spacing={2} fontSize="sm" color="gray.700">
                      <HStack>
                        <FaMapMarkerAlt color="teal" />
                        <Text noOfLines={1}>{spot.address}</Text>
                      </HStack>
                      
                      <HStack>
                        <FaStar color="teal" />
                        <Text>{spot.price}</Text>
                      </HStack>
                      
                      <HStack>
                        <FaPhone color="teal" />
                        <Text>{spot.tel}</Text>
                      </HStack>
                      
                      {spot.homepage && (
                        <HStack>
                          <FaGlobe color="teal" />
                          <Text noOfLines={1} color="teal.500" cursor="pointer">
                            홈페이지
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        ) : (
          <Box textAlign="center" py={16} bg="white" borderRadius="xl" boxShadow="md">
            <FaSearch size={48} color="gray" />
            <Text mt={4} color="gray.600" fontSize="lg">
              검색 조건을 입력하고 검색해보세요
            </Text>
            <Text color="gray.500" fontSize="sm">
              지역, 카테고리, 키워드로 원하는 여행지를 찾을 수 있습니다
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
} 