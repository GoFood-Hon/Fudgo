import { Grid } from "@mantine/core"
import InputField from "../../components/Form/InputField"

const BookingInformation = ({ register, errors }) => {
  return (
    <Grid grow>
      <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
        <InputField label="Precio por silla (Opcional)" type="number" name="pricePerChair" register={register} errors={errors} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
        <InputField
          label="Horas de anticipo para reservar (Opcional)"
          type="number"
          name="hoursBeforeBooking"
          register={register}
          
          errors={errors}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
        <InputField
          label="Horas de anticipo para pagar (Opcional)"
          type="number"
          name="hoursBeforePayment"
          register={register}
          errors={errors}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
        <InputField
          label="Horas de anticipo para cancelar (Opcional)"
          type="number"
          name="hoursBeforeCancellation"
          register={register}
          errors={errors}
        />
      </Grid.Col>
    </Grid>
  )
}

export default BookingInformation
