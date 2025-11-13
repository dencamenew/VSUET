'use client'

import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ILessonSlot, LessonTime } from "@/hooks/api/useTimetable"
import { Language, translations } from "@/lib/translations"
import { SideFade } from './particles/SideFade'
import { useRole } from '../security/useRole'
import { Modal } from '../modals/Modal'
import { Button } from './button'
import { Check, MessageSquareWarning, QrCode } from 'lucide-react'
import { useQRStudentScan, useQRTeacherList, useQRTeacherSession } from '@/hooks/api/websocket/useQR'
import { QRCodeSVG } from 'qrcode.react'
import { Loading } from './loading'
import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { useStudentInfo } from '@/hooks/api/useStudentInfo'

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.85,
        filter: "blur(4px)",
    },
    visible: () => ({
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        zIndex: 50,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 28,
            mass: 0.4,

            opacity: {
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.6,
            },

            scale: {
                type: "spring",
                stiffness: 160,
                damping: 26,
                mass: 1.1,
            },

            filter: {
                type: "spring",
                stiffness: 180,
                damping: 18,
                mass: 0.8,
            }
        }
    }),
    exit: () => ({
        opacity: 0,
        scale: 0.7,
        filter: "blur(8px)",
        zIndex: 40,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 28,
            mass: 0.4,
        }
    })
}

export function QRScanner({ onScan, isScanning }: { onScan: (data: string) => void, isScanning: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [hasScanned, setHasScanned] = useState(false);

    useEffect(() => {
        let animationId: number;
        let mounted = true;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                streamRef.current = stream;

                if (videoRef.current && mounted) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (err) {
                console.error('Camera error:', err);
            }
        };

        const scanQR = () => {
            if (!mounted || hasScanned || isScanning) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code && !hasScanned) {
                    // console.log('QR detected:', code.data);
                    setHasScanned(true);
                    onScan(code.data);
                    return;
                }
            }

            animationId = requestAnimationFrame(scanQR);
        };

        startCamera().then(() => {
            if (mounted) {
                scanQR();
            }
        });

        return () => {
            mounted = false;
            cancelAnimationFrame(animationId);

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [onScan, hasScanned, isScanning]);

    useEffect(() => {
        if (!isScanning) {
            setHasScanned(false);
        }
    }, [isScanning]);

    return (
        <div className="relative w-[300px] h-[300px] rounded-lg overflow-hidden bg-muted">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-64 h-64">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                </div>
            </div>
        </div>
    );
}

function StudentCard(
    {
        zach_number
    }: {
        zach_number: string | undefined
    }
) {
    const data = useStudentInfo(zach_number);

    if (!data) return null;

    return (
        <div
            className="text-sm text-white p-2 bg-green-600/90 rounded flex justify-between"
        >
            <span>{data.first_name} {data.last_name}</span>
            <span>{zach_number}</span>
        </div>
    )
}

export function ScheduleList(
    {
        currentDate,
        currentSchedule,
        language
    }: {
        currentDate: string | undefined,
        currentSchedule: Record<LessonTime, ILessonSlot> | undefined,
        language: Language
    }
) {
    const { role } = useRole();
    const [isOpen, setIsOpen] = useState(false);
    const t = translations[language] || translations.en;

    const {
        data,
        isConnected,
        isActive,
        isCreating,
        error,
        sessionId,
        qrUrl,
        createSession,
        closeSession
    } = useQRTeacherSession();

    const studentsList = useQRTeacherList(sessionId);

    const {
        scan,
        isScanning,
        isSuccess,
        isError,
        error: scanError,
        reset: resetScan
    } = useQRStudentScan();

    // Автозакрытие при успехе
    useEffect(() => {
        if (isSuccess && role === "student") {
            const timeout = setTimeout(() => {
                setIsOpen(false);
                setTimeout(() => resetScan(), 300);
            }, 2000);

            return () => clearTimeout(timeout);
        }
    }, [isSuccess, role, resetScan]);

    const getCardStyles = (type: ILessonSlot['class_type']) => {
        switch (type) {
            case "лекция":
                return "bg-card border border-border border-l-4 border-l-blue-500 shadow-sm hover:shadow-md"
            case "практические занятия":
                return "bg-card border border-border border-l-4 border-l-red-500 shadow-sm hover:shadow-md"
            case "лабораторная работа":
                return "bg-card border border-border border-l-4 border-l-green-500 shadow-sm hover:shadow-md"
            case "семинар":
                return "bg-card border border-border border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md"
            default:
                return "bg-card border border-border border-l-4 border-l-purple-500 shadow-sm hover:shadow-md"
        }
    };

    const getTypeStyles = (type: ILessonSlot['class_type']) => {
        switch (type) {
            case "лекция":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            case "практические занятия":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
            case "лабораторная работа":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"
            case "семинар":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
            default:
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
        }
    };

    const getTypeLabel = (type: ILessonSlot['class_type']) => {
        switch (type) {
            case "лекция":
                return t.lecture
            case "практические занятия":
                return t.practice
            case "лабораторная работа":
                return t.lab
            case "семинар":
                return t.seminar
            default:
                return t.other
        }
    };

    const entries = currentSchedule ?
        Object.entries(currentSchedule)
            .filter(([_, item]) => item && Object.values(item).length)
        :
        [];

    const toggleModal = (time: string, sbj: ILessonSlot) => {
        if (role === "student") {
            resetScan();
        }

        setIsOpen(true);

        if (role === "teacher" && currentDate) {
            const startTime = time.split('-')[0].replace('.', ':');

            createSession({
                group_name: sbj.group,
                subject_name: sbj.name,
                subject_type: sbj.class_type,
                date: currentDate,
                lesson_start_time: startTime,
            });
        }
    }

    const handleQRScan = (result: string) => {
        // console.log('QR scanned:', result);
        scan(result);
    };

    const handleCloseSession = async () => {
        // Для студента просто закрываем и сбрасываем
        if (role === "student") {
            resetScan();
            setIsOpen(false);
            return;
        }

        // Для преподавателя закрываем сессию если она активна
        if (role === "teacher") {
            // Закрываем сессию только если она была создана
            if (sessionId || isConnected || isActive) {
                await closeSession();
            }
            setIsOpen(false);
        }
    };

    return (
        <div className='size-full relative overflow-hidden'>
            <Modal
                isOpen={isOpen}
                onClose={handleCloseSession}
            >
                <div style={{ maxWidth: 300 }}>
                    <h2 className="text-2xl font-bold mb-4 pr-10">
                        {role === "teacher" ? "QR-код для посещаемости" : "Отметить посещение"}
                    </h2>

                    {error && (
                        <p className="text-red-500 mb-4">{String(error)}</p>
                    )}

                    {role === "teacher" && (
                        <>
                            {qrUrl ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div
                                        style={{ width: 300, height: 300 }}
                                        className="p-4 bg-white rounded-lg border flex justify-center items-center"
                                    >
                                        <QRCodeSVG
                                            value={qrUrl}
                                            size={256}
                                            level="H"
                                        />
                                    </div>

                                    <p className="text-sm text-muted-foreground text-center">
                                        Студенты могут отсканировать этот код
                                    </p>
                                    {studentsList?.students && studentsList.students.length > 0 && (
                                        <div className="w-full mt-4">
                                            <h3 className="font-semibold mb-2">
                                                Отметились ({studentsList.students.length}):
                                            </h3>
                                            <div className="max-h-40 overflow-y-auto bg-muted p-2 rounded-md scrollbar-xs">
                                                {studentsList.students.map((student, idx) => (
                                                    <StudentCard key={idx} zach_number={student} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleCloseSession}
                                        variant="destructive"
                                        className="w-full mt-4"
                                    >
                                        Завершить сессию
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center flex-col gap-4">
                                    <div
                                        style={{ width: 300, height: 300 }}
                                        className="p-4 bg-white rounded-lg border flex justify-center items-center"
                                    >
                                        <div className='size-12'>
                                            <Loading />
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center">
                                        {isCreating ? "Создание сессии..." : "Ожидание подключения..."}
                                    </p>
                                    <Button
                                        onClick={handleCloseSession}
                                        variant="outline"
                                        className="w-full mt-4"
                                    >
                                        Отменить
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {role === "student" && (
                        <div className="flex flex-col items-center gap-4">
                            {!isSuccess && !isError && (
                                <>
                                    <QRScanner onScan={handleQRScan} isScanning={isScanning} />
                                    <p className="text-sm text-muted-foreground text-center">
                                        Наведите камеру на QR-код
                                    </p>
                                    {isScanning && (
                                        <div className="flex items-center gap-2">
                                            <div className="size-4"><Loading /></div>
                                            <p className="text-blue-500">Обработка...</p>
                                        </div>
                                    )}
                                    <Button
                                        onClick={handleCloseSession}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Отменить
                                    </Button>
                                </>
                            )}

                            {isSuccess && (
                                <div className="flex flex-col items-center gap-4">
                                    <div
                                        style={{ width: 300, height: 300 }}
                                        className="rounded-lg border flex items-center justify-center bg-green-50 text-green-600 flex-col"
                                    >
                                        <Check className='size-10' />
                                        <p className="text-xl font-semibold text-center mt-2">
                                            Посещение отмечено!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {isError && scanError && (
                                <div className="flex flex-col items-center gap-4">
                                    <div
                                        style={{ width: 300, height: 300 }}
                                        className="rounded-lg border flex items-center justify-center bg-red-50"
                                    >
                                        <div className="text-center p-4 text-red-600 flex flex-col items-center">
                                            <MessageSquareWarning className='size-10' />
                                            <p className="text-xl font-semibold mb-2 mt-4">
                                                Ошибка
                                            </p>
                                            <p className="text-sm text-red-500">
                                                {String(scanError)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={resetScan}
                                        className="w-full"
                                    >
                                        Попробовать снова
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>

            <div className='absolute px-4 z-60 w-full'>
                <SideFade
                    width="100%"
                    height={24}
                    className="bg-gradient-to-b from-background to-transparent left-0 top-0 relative z-60"
                />
            </div>

            <div className="flex flex-col gap-3 items-center h-full w-full overflow-y-auto px-6 py-6 z-30 scrollbar-xs">
                <AnimatePresence mode="popLayout">
                    {entries.length > 0 ? (
                        entries.map(([time, item], index) => (
                            <motion.div
                                key={`${index}-${currentDate}`}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={getCardStyles(item.class_type) + " p-4 rounded-xl w-full max-w-2xl z-30"}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {time} • {item.auditorium}
                                        </p>
                                        {
                                            item.teacher &&
                                            <p className="text-sm text-muted-foreground">
                                                {item.teacher}
                                            </p>
                                        }
                                        <p className="text-sm text-muted-foreground">{item.group}</p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${getTypeStyles(item.class_type)}`}
                                    >
                                        {getTypeLabel(item.class_type)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleModal(time, item)}
                                            className="text-muted-foreground hover:text-foreground rounded-md w-fit px-4 gap-2"
                                        >
                                            <QrCode className='size-5' />
                                            {role === "teacher" ? t.qrMarkTeacher : t.qrMarkStudent}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, filter: "blur(10px)", y: 30, scale: 0.7 }}
                            animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
                            exit={{ opacity: 0, filter: "blur(10px)", y: 30, scale: 0.7 }}
                            transition={{
                                type: "spring",
                                stiffness: 80,
                                damping: 12,
                                mass: 0.8,
                            }}
                            className="size-full pt-10 text-xl text-muted-foreground font-semibold z-20 w-full max-w-2xl"
                        >
                            <div className="rounded-3xl w-full bg-muted py-14 flex items-center justify-center px-10 text-center">
                                {t.noClasses}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}