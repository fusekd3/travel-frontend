import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Select,
  Text,
  SimpleGrid,
  Image,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaSearch, FaStar, FaMapMarkerAlt, FaCalendar, FaUsers } from 'react-icons/fa';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

interface Accommodation {
  id: string;
  name: string;
  address: string | { street: string; city: string; postalCode: string; country: string };
  rating: number;
  amenities: string[];
  description: string;
  images: string[];
  price_range: string;
  category: string;
  latitude: number;
  longitude: number;
}

interface RoomType {
  id: string;
  roomType: string;
  description: string;
  price: number;
  currency: string;
  breakfast: boolean;
  cancellation: string;
  amenities: string[];
}

interface City {
  code: string;
  name: string;
  country: string;
}

interface CreateBookingData {
  accommodation_id: string;
  room_type_id: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  special_requests: string;
}

export default function AccommodationPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // 상태 관리
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // 검색 필터
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(1);
  
  // 예약 모달
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [bookingData, setBookingData] = useState<CreateBookingData>({
    accommodation_id: '',
    room_type_id: '',
    check_in: '',
    check_out: '',
    guest_count: 1,
    special_requests: ''
  });

  // 도시 목록 가져오기
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/amadeus/cities');
      if (response.ok) {
        const data = await response.json();
        setCities(data.data);
      }
    } catch (error) {
      console.error('도시 목록 가져오기 실패:', error);
    }
  };

  // 숙소 검색
  const searchAccommodations = async () => {
    if (!selectedCity || !checkInDate || !checkOutDate) {
      toast({
        title: "검색 조건을 입력해주세요",
        description: "도시, 체크인/아웃 날짜를 모두 입력해주세요.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/amadeus/search-hotels?` +
        `city_code=${selectedCity}&` +
        `check_in=${checkInDate}&` +
        `check_out=${checkOutDate}&` +
        `adults=${guestCount}`
      );

      if (response.ok) {
        const data = await response.json();
        setAccommodations(data.data);
        toast({
          title: "검색 완료",
          description: `${data.count}개의 숙소를 찾았습니다.`,
          status: "success",
          duration: 3000,
        });
      } else {
        throw new Error('검색에 실패했습니다.');
      }
    } catch (error) {
      console.error('숙소 검색 실패:', error);
      toast({
        title: "검색 실패",
        description: "숙소 검색 중 오류가 발생했습니다.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // 객실 정보 가져오기
  const fetchRoomTypes = async (accommodationId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/amadeus/hotel/${accommodationId}/offers?` +
        `check_in=${checkInDate}&` +
        `check_out=${checkOutDate}&` +
        `adults=${guestCount}`
      );

      if (response.ok) {
        const data = await response.json();
        setRoomTypes(data.data);
      }
    } catch (error) {
      console.error('객실 정보 가져오기 실패:', error);
    }
  };

  // 예약 모달 열기
  const handleBookingClick = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation);
    setBookingData(prev => ({
      ...prev,
      accommodation_id: accommodation.id,
      check_in: checkInDate,
      check_out: checkOutDate,
      guest_count: guestCount
    }));
    fetchRoomTypes(accommodation.id);
    onOpen();
  };

  // 예약 생성
  const handleCreateBooking = async () => {
    if (!selectedRoomType) {
      toast({
        title: "객실을 선택해주세요",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const finalBookingData = {
        ...bookingData,
        room_type_id: selectedRoomType.id
      };

      const response = await fetch('http://localhost:8000/api/amadeus/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalBookingData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "예약 완료!",
          description: `예약이 성공적으로 완료되었습니다. (예약번호: ${result.data.booking_id})`,
          status: "success",
          duration: 5000,
        });
        onClose();
        // 예약 목록 새로고침
        searchAccommodations();
      } else {
        throw new Error('예약에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 생성 실패:', error);
      toast({
        title: "예약 실패",
        description: "예약 생성 중 오류가 발생했습니다.",
        status: "error",
        duration: 3000,
      });
    }
  };

  // 주소 포맷팅
  const formatAddress = (address: string | { street: string; city: string; postalCode: string; country: string }) => {
    if (typeof address === 'string') {
      return address;
    }
    return `${address.street}, ${address.city} ${address.postalCode}`;
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      
      <Container maxW="container.xl" py={8} mt="60px">
        <VStack spacing={8} align="stretch">
          {/* 페이지 제목 */}
          <Box textAlign="center">
            <Heading size="lg" color="teal.700" mb={2}>
              🏨 숙소 예약
            </Heading>
            <Text color="gray.600">
              전 세계 최고의 숙소를 찾아보세요
            </Text>
          </Box>

          {/* 검색 필터 */}
          <Box p={6} bg="white" borderRadius="2xl" boxShadow="lg">
            <VStack spacing={4}>
              <Heading size="md" color="teal.600">숙소 검색</Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} w="full">
                {/* 도시 선택 */}
                <FormControl>
                  <FormLabel>도시</FormLabel>
                  <Select
                    placeholder="도시를 선택하세요"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    {cities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* 체크인 날짜 */}
                <FormControl>
                  <FormLabel>체크인</FormLabel>
                  <Input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>

                {/* 체크아웃 날짜 */}
                <FormControl>
                  <FormLabel>체크아웃</FormLabel>
                  <Input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                  />
                </FormControl>

                {/* 게스트 수 */}
                <FormControl>
                  <FormLabel>게스트</FormLabel>
                  <NumberInput
                    min={1}
                    max={10}
                    value={guestCount}
                    onChange={(_, value) => setGuestCount(value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              {/* 검색 버튼 */}
              <Button
                colorScheme="teal"
                size="lg"
                leftIcon={<FaSearch />}
                onClick={searchAccommodations}
                isLoading={searchLoading}
                loadingText="검색 중..."
                w="full"
                maxW="300px"
              >
                숙소 검색
              </Button>
            </VStack>
          </Box>

          {/* 검색 결과 */}
          {accommodations.length > 0 && (
            <Box>
              <Heading size="md" color="teal.600" mb={4}>
                검색 결과 ({accommodations.length}개)
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {accommodations.map((accommodation) => (
                  <Box
                    key={accommodation.id}
                    bg="white"
                    borderRadius="xl"
                    boxShadow="lg"
                    overflow="hidden"
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
                  >
                    {/* 숙소 이미지 */}
                    <Box position="relative">
                      <Image
                        src={accommodation.images[0] || 'https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=No+Image'}
                        alt={accommodation.name}
                        w="full"
                        h="200px"
                        objectFit="cover"
                      />
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="teal"
                        variant="solid"
                      >
                        {accommodation.price_range}
                      </Badge>
                    </Box>

                    {/* 숙소 정보 */}
                    <Box p={4}>
                      <VStack align="stretch" spacing={3}>
                        <Box>
                          <Heading size="md" color="teal.700" mb={2}>
                            {accommodation.name}
                          </Heading>
                          <HStack spacing={2} mb={2}>
                            <FaStar color="gold" />
                            <Text fontWeight="bold">{accommodation.rating}</Text>
                            <Badge colorScheme="blue" variant="subtle">
                              {accommodation.category}
                            </Badge>
                          </HStack>
                        </Box>

                        <HStack spacing={2} color="gray.600">
                          <FaMapMarkerAlt />
                          <Text fontSize="sm" noOfLines={2}>
                            {formatAddress(accommodation.address)}
                          </Text>
                        </HStack>

                        <Text fontSize="sm" color="gray.600" noOfLines={3}>
                          {accommodation.description}
                        </Text>

                        {/* 편의시설 */}
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            편의시설:
                          </Text>
                          <HStack spacing={1} flexWrap="wrap">
                            {accommodation.amenities.slice(0, 4).map((amenity, idx) => (
                              <Badge key={idx} colorScheme="green" variant="subtle" size="sm">
                                {amenity}
                              </Badge>
                            ))}
                            {accommodation.amenities.length > 4 && (
                              <Badge colorScheme="gray" variant="subtle" size="sm">
                                +{accommodation.amenities.length - 4}
                              </Badge>
                            )}
                          </HStack>
                        </Box>

                        {/* 예약 버튼 */}
                        <Button
                          colorScheme="teal"
                          size="sm"
                          onClick={() => handleBookingClick(accommodation)}
                          leftIcon={<FaCalendar />}
                        >
                          예약하기
                        </Button>
                      </VStack>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* 검색 결과가 없을 때 */}
          {accommodations.length === 0 && !loading && (
            <Box textAlign="center" py={12}>
              <Text color="gray.500" fontSize="lg">
                {searchLoading ? "검색 중..." : "검색 조건을 입력하고 숙소를 찾아보세요"}
              </Text>
            </Box>
          )}
        </VStack>

        {/* 예약 모달 */}
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <FaCalendar color="teal" />
                <Text>숙소 예약</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedAccommodation && (
                <VStack spacing={6} align="stretch">
                  {/* 선택된 숙소 정보 */}
                  <Box p={4} bg="gray.50" borderRadius="lg">
                    <Heading size="md" color="teal.700" mb={2}>
                      {selectedAccommodation.name}
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      {formatAddress(selectedAccommodation.address)}
                    </Text>
                  </Box>

                  {/* 객실 선택 */}
                  <Box>
                    <FormLabel fontWeight="bold">객실 선택</FormLabel>
                    <VStack spacing={3} align="stretch">
                      {roomTypes.map((roomType) => (
                        <Box
                          key={roomType.id}
                          p={3}
                          border="2px"
                          borderColor={selectedRoomType?.id === roomType.id ? "teal.300" : "gray.200"}
                          borderRadius="lg"
                          cursor="pointer"
                          onClick={() => setSelectedRoomType(roomType)}
                          _hover={{ borderColor: "teal.200" }}
                        >
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{roomType.roomType}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {roomType.description}
                              </Text>
                              <HStack spacing={2}>
                                {roomType.breakfast && (
                                  <Badge colorScheme="green" size="sm">조식 포함</Badge>
                                )}
                                <Badge colorScheme="blue" size="sm">{roomType.cancellation}</Badge>
                              </HStack>
                            </VStack>
                            <Text fontWeight="bold" color="teal.600" fontSize="lg">
                              {roomType.price.toLocaleString()}원
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  {/* 특별 요청사항 */}
                  <FormControl>
                    <FormLabel fontWeight="bold">특별 요청사항</FormLabel>
                    <Textarea
                      placeholder="추가 요청사항이 있으시면 입력해주세요"
                      value={bookingData.special_requests}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        special_requests: e.target.value
                      }))}
                      rows={3}
                    />
                  </FormControl>

                  {/* 예약 확인 정보 */}
                  <Box p={4} bg="teal.50" borderRadius="lg">
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text>체크인:</Text>
                        <Text fontWeight="bold">{checkInDate}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>체크아웃:</Text>
                        <Text fontWeight="bold">{checkOutDate}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>게스트:</Text>
                        <Text fontWeight="bold">{guestCount}명</Text>
                      </HStack>
                      {selectedRoomType && (
                        <HStack justify="space-between">
                          <Text>객실:</Text>
                          <Text fontWeight="bold">{selectedRoomType.roomType}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>

                  {/* 예약 버튼 */}
                  <Button
                    colorScheme="teal"
                    size="lg"
                    onClick={handleCreateBooking}
                    isDisabled={!selectedRoomType}
                    leftIcon={<FaCalendar />}
                  >
                    예약 완료
                  </Button>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
} 