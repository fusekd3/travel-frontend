import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
  CheckboxGroup,
  Checkbox,
  Select,
  Progress,
  Text,
  SimpleGrid,
  RadioGroup,
  Radio,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaMoneyBillWave, FaHeart, FaRocket, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import regionsData from '../../data/korea_regions.json' assert { type: 'json' };
const regions: Record<string, string[]> = regionsData as any;

const INTERESTS = ['맛집', '자연', '쇼핑', '문화', '액티비티', '휴식'];
const TRANSPORTS = ['대중교통', '렌트카', '도보', '자차'];

const PLAN_STYLES = [
  { value: 'relaxed', label: '여유롭게 (하루 3~4개)' },
  { value: 'normal', label: '보통 (하루 4~5개)' },
  { value: 'tight', label: '빡빡하게 (하루 5~6개)' },
];

export interface TravelPlanFormData {
  sido: string;
  sigungu: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  people: number;
  budget: number;
  interests: string[];
  transport: string;
  style: string;
}

export default function TravelPlanStepper({ onComplete }: { onComplete: (data: TravelPlanFormData) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<TravelPlanFormData>({
    sido: '',
    sigungu: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '20:00',
    people: 1,
    budget: 0,
    interests: [],
    transport: '',
    style: 'normal',
  });

  const SIDO_LIST = Object.keys(regions);
  const SIGUNGU_LIST = form.sido ? regions[form.sido] : [];

  const totalSteps = 5;
  const handleChange = (key: keyof TravelPlanFormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box 
      w="100%" 
      maxW="4xl" 
      mx="auto"
    >
      {/* 고급스러운 헤더 */}
      <VStack spacing={6} mb={8} textAlign="center">
        <VStack spacing={4}>
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            bgGradient="linear(to-r, teal.400, blue.500)"
            bgClip="text"
            textShadow="0 2px 4px rgba(0,0,0,0.1)"
          >
            ✈️ 여행 계획 만들기
          </Text>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="white"
            opacity="0.9"
            maxW="2xl"
            lineHeight="1.6"
          >
            간단한 정보만 입력하면 AI가 완벽한 여행 일정을 만들어드려요!
          </Text>
        </VStack>

        {/* 세련된 진행률 표시 */}
        <Box w="full" maxW="3xl">
          <VStack spacing={4}>
            {/* 스텝 인디케이터 */}
            <HStack spacing={2} justify="center" flexWrap="wrap">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <Box
                  key={idx}
                  w={3}
                  h={3}
                  borderRadius="full"
                  bg={step > idx + 1 ? 'teal.400' : step === idx + 1 ? 'blue.500' : 'whiteAlpha.400'}
                  boxShadow={step === idx + 1 ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'}
                  transition="all 0.3s ease"
                />
              ))}
            </HStack>
            
            {/* 진행률 바 */}
            <Box w="full" position="relative">
              <Progress 
                value={(step / totalSteps) * 100} 
                size="lg" 
                borderRadius="full"
                bg="whiteAlpha.300"
                sx={{
                  '& > div': {
                    background: 'linear-gradient(90deg, #38B2AC 0%, #3182CE 100%)',
                    borderRadius: 'full',
                    boxShadow: '0 2px 8px rgba(56, 178, 172, 0.3)',
                  }
                }}
              />
              <Text 
                mt={3} 
                textAlign="center" 
                color="white" 
                fontWeight="bold"
                fontSize="lg"
                textShadow="0 1px 2px rgba(0,0,0,0.3)"
              >
                {step} / {totalSteps}
              </Text>
            </Box>
          </VStack>
        </Box>
      </VStack>

      {/* 고급스러운 폼 컨테이너 */}
      <Box 
        bg={bgColor} 
        borderRadius="3xl" 
        boxShadow="0 25px 50px rgba(0,0,0,0.15)" 
        p={8}
        border="1px solid"
        borderColor={borderColor}
        backdropFilter="blur(20px)"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: 'linear-gradient(90deg, #38B2AC 0%, #3182CE 100%)',
        }}
      >
        <VStack spacing={8} align="stretch">
          {/* Step 1: 여행지 선택 */}
          {step === 1 && (
            <VStack align="stretch" spacing={6}>
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Box
                    w={10}
                    h={10}
                    bgGradient="linear(to-br, teal.400, blue.400)"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="lg"
                    boxShadow="0 4px 15px rgba(56, 178, 172, 0.3)"
                  >
                    <Icon as={FaMapMarkerAlt} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="teal.600" fontSize="lg">
                      여행지 선택
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      어디로 여행을 떠나시나요?
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700" fontSize="md">시/도 선택</FormLabel>
                <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
                  {SIDO_LIST.map(sido => (
                    <Button
                      key={sido}
                      size="lg"
                      colorScheme={form.sido === sido ? 'teal' : 'gray'}
                      variant={form.sido === sido ? 'solid' : 'outline'}
                      onClick={() => {
                        handleChange('sido', sido);
                        handleChange('sigungu', '');
                      }}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                      transition="all 0.3s ease"
                      borderRadius="xl"
                      fontWeight="medium"
                      borderWidth="2px"
                    >
                      {sido}
                    </Button>
                  ))}
                </SimpleGrid>
              </FormControl>

              {form.sido && (
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color="gray.700" fontSize="md">시/군/구 선택</FormLabel>
                  <Select
                    size="lg"
                    placeholder="시/군/구를 선택하세요"
                    value={form.sigungu}
                    onChange={e => handleChange('sigungu', e.target.value)}
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'teal.500',
                      boxShadow: '0 0 0 3px rgba(56, 178, 172, 0.1)',
                    }}
                    _hover={{
                      borderColor: 'teal.400',
                    }}
                    transition="all 0.2s"
                  >
                    {SIGUNGU_LIST.map((sg: string) => (
                      <option key={sg} value={sg}>{sg}</option>
                    ))}
                  </Select>
                </FormControl>
              )}
            </VStack>
          )}

          {/* Step 2: 일정 설정 */}
          {step === 2 && (
            <VStack spacing={6} align="stretch">
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Box
                    w={10}
                    h={10}
                    bgGradient="linear(to-br, blue.400, purple.400)"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="lg"
                    boxShadow="0 4px 15px rgba(59, 130, 246, 0.3)"
                  >
                    <Icon as={FaCalendarAlt} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="blue.600" fontSize="lg">
                      일정 설정
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      언제부터 언제까지 여행하시나요?
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color="gray.700" fontSize="md">여행 시작일</FormLabel>
                  <Input 
                    type="date" 
                    value={form.startDate} 
                    onChange={e => handleChange('startDate', e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                    }}
                    _hover={{
                      borderColor: 'blue.400',
                    }}
                    transition="all 0.2s"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color="gray.700" fontSize="md">여행 시작시간</FormLabel>
                  <Input 
                    type="time" 
                    value={form.startTime} 
                    onChange={e => handleChange('startTime', e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                    }}
                    _hover={{
                      borderColor: 'blue.400',
                    }}
                    transition="all 0.2s"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color="gray.700" fontSize="md">여행 종료일</FormLabel>
                  <Input 
                    type="date" 
                    value={form.endDate} 
                    onChange={e => handleChange('endDate', e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                    }}
                    _hover={{
                      borderColor: 'blue.400',
                    }}
                    transition="all 0.2s"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color="gray.700" fontSize="md">여행 종료시간</FormLabel>
                  <Input 
                    type="time" 
                    value={form.endTime} 
                    onChange={e => handleChange('endTime', e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                    }}
                    _hover={{
                      borderColor: 'blue.400',
                    }}
                    transition="all 0.2s"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          )}

          {/* Step 3: 인원 설정 */}
          {step === 3 && (
            <VStack spacing={6} align="stretch">
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Box
                    w={10}
                    h={10}
                    bgGradient="linear(to-br, purple.400, pink.400)"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="lg"
                    boxShadow="0 4px 15px rgba(128, 90, 213, 0.3)"
                  >
                    <Icon as={FaUsers} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="purple.600" fontSize="lg">
                      인원 설정
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      몇 명이 함께 여행하시나요?
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700" fontSize="md">인원수</FormLabel>
                <NumberInput 
                  min={1} 
                  max={20}
                  value={form.people} 
                  onChange={(_, v) => handleChange('people', v)}
                  size="lg"
                >
                  <NumberInputField 
                    placeholder="여행 인원을 입력하세요" 
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'purple.500',
                      boxShadow: '0 0 0 3px rgba(128, 90, 213, 0.1)',
                    }}
                    _hover={{
                      borderColor: 'purple.400',
                    }}
                    transition="all 0.2s"
                  />
                </NumberInput>
              </FormControl>
            </VStack>
          )}

          {/* Step 4: 예산 설정 */}
          {step === 4 && (
            <VStack spacing={6} align="stretch">
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Box
                    w={10}
                    h={10}
                    bgGradient="linear(to-br, orange.400, red.400)"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="lg"
                    boxShadow="0 4px 15px rgba(237, 137, 54, 0.3)"
                  >
                    <Icon as={FaMoneyBillWave} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="orange.600" fontSize="lg">
                      예산 설정
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      여행 예산은 얼마로 설정하시나요?
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700" fontSize="md">예산 (원)</FormLabel>
                <NumberInput 
                  min={0} 
                  value={form.budget} 
                  onChange={(_, v) => handleChange('budget', v)}
                  size="lg"
                >
                  <NumberInputField 
                    placeholder="여행 예산을 입력해 주세요" 
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'orange.500',
                      boxShadow: '0 0 0 3px rgba(237, 137, 54, 0.1)',
                    }}
                    _hover={{
                      borderColor: 'orange.400',
                    }}
                    transition="all 0.2s"
                  />
                </NumberInput>
              </FormControl>
            </VStack>
          )}

          {/* Step 5: 선호도 설정 */}
          {step === 5 && (
            <VStack spacing={6} align="stretch">
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Box
                    w={10}
                    h={10}
                    bgGradient="linear(to-br, pink.400, red.400)"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="lg"
                    boxShadow="0 4px 15px rgba(236, 72, 153, 0.3)"
                  >
                    <Icon as={FaHeart} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="pink.600" fontSize="lg">
                      선호도 설정
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      어떤 스타일의 여행을 원하시나요?
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <FormControl>
                <FormLabel fontWeight="bold" color="gray.700" fontSize="md">관심사</FormLabel>
                <CheckboxGroup
                  value={form.interests}
                  onChange={v => handleChange('interests', v)}
                >
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                    {INTERESTS.map(i => (
                      <Checkbox 
                        key={i} 
                        value={i}
                        colorScheme="pink"
                        size="lg"
                        _hover={{
                          transform: 'translateY(-1px)',
                        }}
                        transition="all 0.2s"
                      >
                        {i}
                      </Checkbox>
                    ))}
                  </SimpleGrid>
                </CheckboxGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color="gray.700" fontSize="md">이동수단</FormLabel>
                <Select
                  size="lg"
                  placeholder="이동수단을 선택하세요"
                  value={form.transport}
                  onChange={e => handleChange('transport', e.target.value)}
                  borderRadius="xl"
                  borderWidth="2px"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: 'pink.500',
                    boxShadow: '0 0 0 3px rgba(236, 72, 153, 0.1)',
                  }}
                  _hover={{
                    borderColor: 'pink.400',
                  }}
                  transition="all 0.2s"
                >
                  {TRANSPORTS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700" fontSize="md">일정 스타일</FormLabel>
                <RadioGroup
                  value={form.style}
                  onChange={v => handleChange('style', v)}
                >
                  <VStack spacing={4} align="stretch">
                    {PLAN_STYLES.map(s => (
                      <Box
                        key={s.value}
                        p={4}
                        border="2px solid"
                        borderColor={form.style === s.value ? 'pink.500' : 'gray.200'}
                        borderRadius="xl"
                        bg={form.style === s.value ? 'pink.50' : 'transparent'}
                        cursor="pointer"
                        onClick={() => handleChange('style', s.value)}
                        _hover={{
                          borderColor: 'pink.300',
                          bg: 'pink.50',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        }}
                        transition="all 0.3s ease"
                      >
                        <Radio value={s.value} colorScheme="pink" size="lg">
                          <Text fontWeight="bold" color="gray.800">
                            {s.label}
                          </Text>
                        </Radio>
                      </Box>
                    ))}
                  </VStack>
                </RadioGroup>
              </FormControl>
            </VStack>
          )}

          {/* 고급스러운 네비게이션 버튼 */}
          <HStack justify="space-between" w="100%" pt={6}>
            <Button 
              onClick={handlePrev} 
              isDisabled={step === 1}
              size="lg"
              variant="outline"
              colorScheme="gray"
              borderRadius="xl"
              px={8}
              leftIcon={<Icon as={FaArrowLeft} />}
              _hover={{
                bg: 'gray.50',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.3s ease"
              borderWidth="2px"
            >
              이전
            </Button>
            
            {step < totalSteps ? (
              <Button 
                colorScheme="teal" 
                onClick={handleNext} 
                isDisabled={
                  (step === 1 && (!form.sido || !form.sigungu)) ||
                  (step === 2 && (!form.startDate || !form.startTime || !form.endDate || !form.endTime)) ||
                  (step === 3 && !form.people) ||
                  (step === 4 && !form.budget)
                }
                size="lg"
                borderRadius="xl"
                px={8}
                rightIcon={<Icon as={FaArrowRight} />}
                bgGradient="linear(to-r, teal.400, blue.400)"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(56, 178, 172, 0.3)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.3s ease"
                color="white"
              >
                다음
              </Button>
            ) : (
              <Button 
                colorScheme="teal" 
                onClick={() => onComplete(form)}
                size="lg"
                borderRadius="xl"
                px={8}
                rightIcon={<Icon as={FaRocket} />}
                bgGradient="linear(to-r, teal.400, blue.400)"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(56, 178, 172, 0.3)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.3s ease"
                color="white"
              >
                🚀 계획 생성하기
              </Button>
            )}
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
} 