import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import BackButton from "../Dishes/components/BackButton"
import { colors } from "../../theme/colors"
import {
  Text,
  ActionIcon,
  Button,
  Group,
  Stack,
  Grid,
  Badge,
  Card,
  Modal,
  Textarea,
  Avatar,
  Title,
  Divider,
  Flex,
  Space,
  Tooltip,
  Loader,
  PinInput
} from "@mantine/core"
import {
  addCommentsToReservation,
  approveRescheduleReservation,
  approveReservation,
  cancelReservation,
  fetchReservationDetails,
  invalidRescheduleReservation,
  markAsExpired,
  markAsUsed,
  setReservationComment
} from "../../store/features/reservationsSlice"
import { useDispatch, useSelector } from "react-redux"
import classes from "./Reservations.module.css"
import { useDisclosure } from "@mantine/hooks"
import {
  IconChairDirector,
  IconCalendarStats,
  IconCheck,
  IconCopy,
  IconId,
  IconCreditCardFilled,
  IconPhone
} from "@tabler/icons-react"
import { formatTime, getFormattedHNL } from "../../utils"
import { showNotification } from "@mantine/notifications"
import { ReservationComments } from "./ReservationComments"
import { IconScan } from "@tabler/icons-react"
import { reservationColorStatus, reservationLabels } from "../../utils/constants"
import { ManualCopyButton } from "../../components/ManualCopyButton"

export const ReservationDetails = () => {
  const { reservationId } = useParams()
  const user = useSelector((state) => state.user.value)
  const {
    reservationDetails,
    loadingReservationsDetails,
    reservationComment,
    addingComment,
    cancellingReservation,
    approvingReservation,
    updatingStatus
  } = useSelector((state) => state.reservations)
  const dispatch = useDispatch()
  const [opened, { close, open }] = useDisclosure(false)
  const [modalAction, setModalAction] = useState(null)
  const [cancelComment, setCancelComment] = useState("")
  const searchData = useSelector((state) => state.reservations.searchData)
  const shouldMaskReservationCode = user?.role === "cashier" && searchData !== reservationDetails?.reservationCode

  useEffect(() => {
    dispatch(fetchReservationDetails(reservationId))
  }, [dispatch, reservationId])

  const handleCreateComment = () => {
    if (reservationComment.trim() !== "") {
      dispatch(addCommentsToReservation({ reservationId, params: { comment: reservationComment } })).then(() => {
        dispatch(setReservationComment(""))
      })
    } else {
      showNotification({
        title: "Error",
        message: "Debes escribir un comentario primero",
        color: "red",
        duration: 7000
      })
    }
  }

  const handleCancelReservation = () => {
    dispatch(cancelReservation({ reservationId, params: { revisedBy: user?.id, comment: cancelComment } }))
  }

  const handleApproveReservation = () => {
    dispatch(approveReservation({ reservationId, revisedBy: user?.id }))
  }

  const handleApproveRescheduleReservation = () => {
    dispatch(approveRescheduleReservation({ reservationId, comment: cancelComment }))
  }

  const handleInvalidRescheduleReservation = () => {
    dispatch(invalidRescheduleReservation({ reservationId, comment: cancelComment }))
  }

  const handleMarkAsUsed = () => {
    dispatch(markAsUsed(reservationDetails?.reservationCode))
  }

  const handleMarkAsExpired = () => {
    dispatch(markAsExpired(reservationId))
  }

  const handleOpenModal = (action) => {
    setModalAction(action)
    setCancelComment("")
    open()
  }

  const handleCloseModal = () => {
    setModalAction(null)
    setCancelComment("")
    close()
  }

  const isRescheduleRequested = reservationDetails?.status === "rescheduling-requested"
  const requiresComment = ["cancel", "invalid-reschedule"].includes(modalAction)
  const isSubmitting = cancellingReservation || approvingReservation || updatingStatus

  const modalTitle =
    modalAction === "cancel"
      ? "¿Estás seguro que deseas cancelar esta reservación?"
      : modalAction === "approve"
        ? "¿Estás seguro que deseas aprobar esta reservación?"
        : modalAction === "approve-reschedule"
          ? "¿Estás seguro que deseas aprobar la solicitud de reagendamiento?"
          : modalAction === "invalid-reschedule"
            ? "¿Estás seguro que deseas invalidar la solicitud de reagendamiento?"
            : modalAction === "mark-expired"
              ? "¿Estás seguro que deseas marcar esta reservación como expirada?"
              : "¿Estás seguro que deseas marcar esta reservación como usada?"

  const modalDescription =
    modalAction === "cancel"
      ? "La reservación se marcará como cancelada"
      : modalAction === "approve"
        ? "La reservación se marcará como aprobada"
        : modalAction === "approve-reschedule"
          ? "La reservación se reagendará a la nueva fecha propuesta por el cliente"
          : modalAction === "invalid-reschedule"
            ? ""
            : modalAction === "mark-expired"
              ? "La reservación se marcará como expirada"
              : "La reservación se marcará como usada"

  const commentPlaceholder =
    modalAction === "cancel"
      ? "Ingresa el motivo de la cancelación"
      : modalAction === "approve-reschedule"
        ? "Ingresa un comentario para aprobar la solicitud de reagendamiento"
        : "Ingresa un comentario para invalidar la solicitud de reagendamiento"

  const commentErrorMessage =
    modalAction === "cancel"
      ? "Debes escribir un comentario antes de cancelar"
      : modalAction === "approve-reschedule"
        ? "Debes escribir un comentario antes de aprobar la solicitud de reagendamiento"
        : "Debes escribir un comentario antes de invalidar la solicitud de reagendamiento"

  const handleConfirmAction = () => {
    if (requiresComment && cancelComment.trim() === "") {
      showNotification({
        title: "Error",
        message: commentErrorMessage,
        color: "red",
        duration: 7000
      })
      return
    }

    if (modalAction === "cancel") {
      handleCancelReservation()
    } else if (modalAction === "approve") {
      handleApproveReservation()
    } else if (modalAction === "approve-reschedule") {
      handleApproveRescheduleReservation()
    } else if (modalAction === "invalid-reschedule") {
      handleInvalidRescheduleReservation()
    } else if (modalAction === "mark-expired") {
      handleMarkAsExpired()
    } else if (modalAction === "mark-used") {
      handleMarkAsUsed()
    }

    handleCloseModal()
  }

  return (
    <>
      {loadingReservationsDetails ? (
        <div className="h-[calc(100vh-150px)] w-full flex justify-center items-center">
          <Loader color={colors.main_app_color} />
        </div>
      ) : (
        <Stack gap="xs">
          <Group>
            <Flex align="center" justify="space-between" gap="xs">
              <BackButton title="Detalles de reservación" show />
            </Flex>
          </Group>

          <Grid gutter="sm">
            <Grid.Col span={{ base: 12, lg: 8 }} className={classes.detailsColumn}>
              <Card withBorder radius="md" p="md" className={`${classes.card} ${classes.detailsCard}`} mih={310}>
                <Flex direction="column" h="100%">
                  <Stack>
                    <Card.Section>
                      <Text tt="uppercase" size="lg" p="sm" fw={700}>
                        {reservationDetails?.Sucursal?.name}
                      </Text>
                    </Card.Section>
                    <Flex align="center" gap={5}>
                      <IconScan size={25} />
                      <Text size="sm" fw={500}>
                        Código:
                      </Text>
                      <PinInput
                        gap={2}
                        defaultValue={reservationDetails?.reservationCode}
                        length={reservationDetails?.reservationCode?.length}
                        size="xs"
                        mask={shouldMaskReservationCode}
                        readOnly
                      />
                      {user?.role !== "cashier" && (
                        <ManualCopyButton
                          value={reservationDetails?.reservationCode ?? ""}
                          errorMessage="No se pudo copiar el código al portapapeles">
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? "Copiado" : "Copiar"}>
                              <ActionIcon
                                variant="subtle"
                                color={copied ? "teal" : "gray"}
                                onClick={copy}
                                aria-label="Copiar código de reservación">
                                {copied ? <IconCheck size={18} /> : <IconCopy size={16} />}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </ManualCopyButton>
                      )}
                    </Flex>
                    <Flex align="center" gap={5}>
                      <IconId size={25} />
                      <Text size="sm" fw={500}>
                        ID: {reservationId?.split("-")[4]?.substring(0, 6)?.toUpperCase()}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={5}>
                      <IconChairDirector size={25} />
                      <Text size="sm">Sillas reservadas:</Text>
                      <Text size="sm">{reservationDetails?.chairs}</Text>
                    </Flex>
                    <Flex align="center" gap={5}>
                      <IconCalendarStats size={25} />
                      <Text size="sm">Fecha y hora de reserva:</Text>
                      <Text size="sm">{formatTime(reservationDetails?.reservationDate)}</Text>
                    </Flex>
                    <Flex align="center" gap={5}>
                      <IconCreditCardFilled size={25} />
                      <Text size="sm">
                        {reservationDetails?.isPayed
                          ? `Se pagó el ${formatTime(reservationDetails?.paidDate)}`
                          : "No se ha realizado el pago"}
                      </Text>
                    </Flex>
                  </Stack>
                  <div className={classes.cardFooter}>
                    <Divider my="sm" />
                    <Card.Section className={classes.section}>
                      <Flex align="center" gap={10} justify="end">
                        {!["confirmed", "rescheduling-confirmed", "used", "expired", "rescheduling-invalid"].includes(
                          reservationDetails?.status
                        ) && (
                          <>
                            <Tooltip
                              hidden={["pending", "rescheduling-requested"].includes(reservationDetails?.status)}
                              label="No es posible modificar el estado">
                              <Button
                                className={classes.button}
                                variant="outline"
                                loading={cancellingReservation}
                                disabled={["cancelled", "approved", "rescheduling-confirmed", "rescheduling-invalid"].includes(
                                  reservationDetails?.status
                                )}
                                color={colors.main_app_color}
                                onClick={() => {
                                  handleOpenModal(isRescheduleRequested ? "invalid-reschedule" : "cancel")
                                }}>
                                {isRescheduleRequested ? "Invalidar" : "Cancelar"}
                              </Button>
                            </Tooltip>
                            <Tooltip
                              hidden={["pending", "rescheduling-requested"].includes(reservationDetails?.status)}
                              label="No es posible modificar el estado">
                              <Button
                                className={classes.button}
                                loading={approvingReservation}
                                disabled={["cancelled", "approved", "rescheduling-confirmed", "rescheduling-invalid"].includes(
                                  reservationDetails?.status
                                )}
                                color={colors.main_app_color}
                                onClick={() => {
                                  handleOpenModal(isRescheduleRequested ? "approve-reschedule" : "approve")
                                }}>
                                Aprobar
                              </Button>
                            </Tooltip>
                          </>
                        )}
                        {["confirmed", "rescheduling-confirmed", "expired", "used", "rescheduling-invalid"].includes(
                          reservationDetails?.status
                        ) && (
                          <Tooltip
                            hidden={["confirmed", "rescheduling-confirmed"].includes(reservationDetails?.status)}
                            label="No es posible modificar el estado">
                            <Button
                              className={classes.button}
                              loading={updatingStatus}
                              disabled={["used", "expired", "rescheduling-invalid"].includes(reservationDetails?.status)}
                              color={colors.main_app_color}
                              variant="outline"
                              onClick={() => {
                                handleOpenModal("mark-expired")
                              }}>
                              Marcar como expirada
                            </Button>
                          </Tooltip>
                        )}
                        {["confirmed", "rescheduling-confirmed", "used", "expired", "rescheduling-invalid"].includes(
                          reservationDetails?.status
                        ) && (
                          <Tooltip
                            hidden={["confirmed", "rescheduling-confirmed"].includes(reservationDetails?.status)}
                            label="No es posible modificar el estado">
                            <Button
                              className={classes.button}
                              loading={updatingStatus}
                              disabled={["used", "expired", "rescheduling-invalid"].includes(reservationDetails?.status)}
                              color={colors.main_app_color}
                              onClick={() => {
                                handleOpenModal("mark-used")
                              }}>
                              Marcar como usada
                            </Button>
                          </Tooltip>
                        )}
                      </Flex>
                    </Card.Section>
                  </div>
                </Flex>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }} className={classes.detailsColumn}>
              <Card withBorder radius="md" p="md" className={`${classes.card} ${classes.detailsCard}`} mih={310}>
                <Flex direction="column" h="100%">
                  <Stack>
                    <Flex align="center" gap={5}>
                      <Text>Estado de la reservación:</Text>
                      <Badge size="md" color={reservationColorStatus[reservationDetails?.status]}>
                        {reservationLabels[reservationDetails?.status]}
                      </Badge>
                    </Flex>
                    <Flex align="center" gap={5}>
                      <IconCalendarStats size={25} />
                      <Text size="sm">
                        {reservationDetails?.createdAt === reservationDetails?.updatedAt ? "Creado" : "Actualizado"} el{" "}
                        {formatTime(reservationDetails?.updatedAt)}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={5}>
                      <Avatar src={reservationDetails?.UserThatReserved?.photo} />
                      <Text size="sm">{reservationDetails?.UserThatReserved?.name}</Text>
                    </Flex>
                    <Flex align="center" gap={5}>
                      <IconId size={25} />
                      <Text size="sm">{reservationDetails?.UserThatReserved?.identityNumber}</Text>
                    </Flex>
                    <Flex align="center" gap={5}>
                      <IconPhone size={25} />
                      <Text size="sm">{reservationDetails?.UserThatReserved?.phoneNumber}</Text>
                    </Flex>
                  </Stack>
                  <div className={classes.cardFooter}>
                    <Divider my="sm" />
                    <Card.Section className={classes.section}>
                      <Flex align="center" py={5} justify="space-between">
                        <Text fw={500}>Total:</Text>
                        <Text fw={500}>{getFormattedHNL(reservationDetails?.total)}</Text>
                      </Flex>
                    </Card.Section>
                  </div>
                </Flex>
              </Card>
            </Grid.Col>

            <Grid.Col>
              <Card withBorder radius="md" className={classes.comment}>
                <Title order={4}>Comentarios y actualizaciones ({reservationDetails?.ReservationComments?.length || 0})</Title>
                <Space h="sm" />
                <Textarea
                  classNames={{
                    input: "focus:border-gray-600"
                  }}
                  placeholder="Escribe un comentario"
                  onChange={(e) => dispatch(setReservationComment(e.target.value))}
                  value={reservationComment}
                />
                <Space h="sm" />
                <Flex justify="end">
                  <Button
                    className={classes.button}
                    loading={addingComment}
                    disabled={reservationComment.length === 0}
                    color={colors.main_app_color}
                    onClick={handleCreateComment}>
                    Publicar
                  </Button>
                </Flex>
              </Card>
              <Space h="sm" />
              {reservationDetails?.ReservationComments?.map((comment) => (
                <ReservationComments
                  key={comment?.id}
                  isAdminComment={comment?.AdminUser}
                  id={comment?.id}
                  name={comment?.AdminUser?.name || comment?.User?.name}
                  createdAt={comment?.createdAt}
                  image={comment?.AdminUser?.images?.[0]?.location || comment?.User?.photo}
                  userComment={comment?.comment}
                />
              ))}
            </Grid.Col>
          </Grid>

          <Modal
            opened={opened}
            radius="md"
            onClose={handleCloseModal}
            withCloseButton={false}
            closeOnEscape
            size="md"
            overlayProps={{
              backgroundOpacity: 0.55,
              blur: 3
            }}
            title={modalTitle}>
            <Text size="md">{modalDescription}</Text>
            {requiresComment ? (
              <Textarea
                classNames={{
                  input: "focus:border-gray-600"
                }}
                placeholder={commentPlaceholder}
                value={cancelComment}
                onChange={(e) => setCancelComment(e.target.value)}
                autosize
                minRows={2}
                maxRows={4}
              />
            ) : (
              ""
            )}

            <Group mt="sm" justify="end">
              <Button
                color={colors.main_app_color}
                variant="outline"
                onClick={() => {
                  handleCloseModal()
                }}>
                Cancelar
              </Button>
              <Button color={colors.main_app_color} loading={isSubmitting} onClick={handleConfirmAction}>
                Confirmar
              </Button>
            </Group>
          </Modal>
        </Stack>
      )}
    </>
  )
}
