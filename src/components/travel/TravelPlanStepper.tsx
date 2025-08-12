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
} from '@chakra-ui/react';
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
    startTime: '',
    endDate: '',
    endTime: '',
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

  return (
    <Box p={6} bg="white" borderRadius="2xl" boxShadow="xl" w="100%" maxW="lg">
      <Progress value={(step / totalSteps) * 100} mb={6} colorScheme="teal" />
      <Text mb={4} fontWeight="bold" color="teal.600">{step} / {totalSteps}</Text>
      <VStack spacing={6} align="stretch">
        {step === 1 && (
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>시/도 선택</FormLabel>
              <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={2}>
                {SIDO_LIST.map(sido => (
                  <Button
                    key={sido}
                    colorScheme={form.sido === sido ? 'teal' : 'gray'}
                    variant={form.sido === sido ? 'solid' : 'outline'}
                    onClick={() => {
                      handleChange('sido', sido);
                      handleChange('sigungu', '');
                    }}
                  >
                    {sido}
                  </Button>
                ))}
              </SimpleGrid>
            </FormControl>
            {form.sido && (
              <FormControl isRequired>
                <FormLabel>시/군/구 선택</FormLabel>
                <Select
                  placeholder="시/군/구를 선택하세요"
                  value={form.sigungu}
                  onChange={e => handleChange('sigungu', e.target.value)}
                >
                  {SIGUNGU_LIST.map((sg: string) => (
                    <option key={sg} value={sg}>{sg}</option>
                  ))}
                </Select>
              </FormControl>
            )}
          </VStack>
        )}
        {step === 2 && (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>여행 시작일</FormLabel>
              <Input type="date" value={form.startDate} onChange={e => handleChange('startDate', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>여행 시작시간</FormLabel>
              <Input type="time" value={form.startTime} onChange={e => handleChange('startTime', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>여행 종료일</FormLabel>
              <Input type="date" value={form.endDate} onChange={e => handleChange('endDate', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>여행 종료시간</FormLabel>
              <Input type="time" value={form.endTime} onChange={e => handleChange('endTime', e.target.value)} />
            </FormControl>
          </VStack>
        )}
        {step === 3 && (
          <FormControl isRequired>
            <FormLabel>인원수</FormLabel>
            <NumberInput min={1} value={form.people} onChange={(_, v) => handleChange('people', v)}>
              <NumberInputField placeholder="몇 명이 함께 여행하시나요?" />
            </NumberInput>
          </FormControl>
        )}
        {step === 4 && (
          <FormControl isRequired>
            <FormLabel>예산(원)</FormLabel>
            <NumberInput min={0} value={form.budget} onChange={(_, v) => handleChange('budget', v)}>
              <NumberInputField placeholder="여행 예산을 입력해 주세요" />
            </NumberInput>
          </FormControl>
        )}
        {step === 5 && (
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>관심사</FormLabel>
              <CheckboxGroup
                value={form.interests}
                onChange={v => handleChange('interests', v)}
              >
                <HStack spacing={4} wrap="wrap">
                  {INTERESTS.map(i => (
                    <Checkbox key={i} value={i}>{i}</Checkbox>
                  ))}
                </HStack>
              </CheckboxGroup>
            </FormControl>
            <FormControl>
              <FormLabel>이동수단</FormLabel>
              <Select
                placeholder="이동수단을 선택하세요"
                value={form.transport}
                onChange={e => handleChange('transport', e.target.value)}
              >
                {TRANSPORTS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>일정 스타일</FormLabel>
              <RadioGroup
                value={form.style}
                onChange={v => handleChange('style', v)}
              >
                <HStack spacing={6}>
                  {PLAN_STYLES.map(s => (
                    <Radio key={s.value} value={s.value}>{s.label}</Radio>
                  ))}
                </HStack>
              </RadioGroup>
            </FormControl>
          </VStack>
        )}
        <HStack justify="space-between" w="100%">
          <Button onClick={handlePrev} isDisabled={step === 1}>이전</Button>
          {step < totalSteps ? (
            <Button colorScheme="teal" onClick={handleNext} isDisabled={
              (step === 1 && (!form.sido || !form.sigungu)) ||
              (step === 2 && (!form.startDate || !form.startTime || !form.endDate || !form.endTime)) ||
              (step === 3 && !form.people) ||
              (step === 4 && !form.budget)
            }>다음</Button>
          ) : (
            <Button colorScheme="teal" onClick={() => onComplete(form)}>
              계획 생성
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
} 